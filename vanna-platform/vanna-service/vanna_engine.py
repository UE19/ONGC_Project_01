"""
Vanna Engine — wraps Vanna AI library.
Manages one Vanna instance per profile (schema-isolated).
Provides: SQL generation, SQL explanation, result summarization, schema training.

LLM Backend: Ollama (local, free) via OpenAI-compatible API at
             http://host.docker.internal:11434/v1
"""
import logging
import os
import re
from typing import Any, Dict, List, Optional

from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Ollama client (OpenAI-compatible, no API key needed) ──────────────────────
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434/v1")
OPENAPI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def _ollama_client() -> OpenAI:
    return OpenAI(api_key=OPENAPI_API_KEY, base_url=OLLAMA_BASE_URL)


class VannaEngine:
    """
    SQL generation engine using Ollama as the LLM backend.
    Always uses a direct Ollama call with the schema DDL provided as context.
    Post-processing corrects common table/column name errors from small models.
    """

    def __init__(self, openai_api_key: str, model: str):
        self.openai_api_key = openai_api_key
        self.model = model
        self._instances: Dict[str, Any] = {}

    # ── SQL Generation ────────────────────────────────────────────────────────

    def generate_sql(self, profile_id: str, db_type: str, question: str,
                     schema_context: Optional[Dict[str, Any]]) -> Optional[str]:
        """
        Generate SQL from a natural language question using Ollama.
        Always uses direct Ollama call with DDL schema context.
        Post-processes result to fix common table/column name mistakes.
        """
        schema_ctx = schema_context or {}

        # ── Direct Ollama call with schema DDL ────────────────────────────────
        sql = self._direct_ollama_sql(db_type, question, schema_ctx)
        if not sql:
            return None

        logger.debug(f"[generate_sql] after ollama: {sql[:300]}")

        # ── Post-process: fix wrong table names, then wrong column names ──────
        sql = self._fix_sql_tables(sql, schema_ctx)
        logger.debug(f"[generate_sql] after fix_tables: {sql[:300]}")

        sql = self._fix_sql_columns(sql, schema_ctx)
        logger.debug(f"[generate_sql] after fix_columns: {sql[:300]}")

        return sql

    def _build_schema_ddl(self, schema_context: Dict[str, Any]) -> str:
        """Convert schema_context into CREATE TABLE DDL so Ollama sees exact names.
        Boolean columns get inline comments so the LLM knows to use TRUE/FALSE."""
        ddl_parts = []
        for table_name, meta in schema_context.items():
            cols = meta.get("columns", [])
            if not cols:
                continue
            col_lines = []
            for c in cols:
                if isinstance(c, dict):
                    col_name = c.get('name', '')
                    col_type = c.get('type', 'TEXT')
                    # Add comment for boolean columns so Ollama uses correct syntax
                    if col_type.upper() in ('BOOLEAN', 'BOOL'):
                        col_lines.append(
                            f"  {col_name} {col_type}  -- use: {col_name} = TRUE or {col_name} = FALSE"
                        )
                    else:
                        col_lines.append(f"  {col_name} {col_type}")
                else:
                    col_lines.append(f"  {str(c)} TEXT")
            ddl_parts.append(
                f"CREATE TABLE {table_name} (\n" + ",\n".join(col_lines) + "\n);"
            )
        return "\n\n".join(ddl_parts)

    def _fix_sql_tables(self, sql: str, schema_context: Dict[str, Any]) -> str:
        """
        Replace wrong table names with the correct ones from the schema.

        Priority order (strongest signal first):
        1. Prefix:   equipment       → equipment_assets  (valid starts with used)
        2. Suffix:   assets          → equipment_assets  (valid ENDS WITH used — stronger than plural)
        3. Plural:   budgets         → budget_allocations (strip s, retry prefix)
        4. Contains: safety_incidents→ incidents          (used ends with valid)
        """
        if not schema_context:
            return sql

        valid_tables = list(schema_context.keys())
        if not valid_tables:
            return sql

        from_join_re = re.compile(r'\b(FROM|JOIN)\s+([`"\w]+)', re.IGNORECASE)

        result = sql
        for m in from_join_re.finditer(sql):
            used_name = m.group(2).strip('`"')
            # Already a valid table name?
            if any(used_name.lower() == v.lower() for v in valid_tables):
                continue

            # Case 1: valid table starts with used_name (equipment → equipment_assets)
            candidates = [v for v in valid_tables if v.lower().startswith(used_name.lower())]

            # Case 2: valid table ENDS WITH used_name (assets → equipment_assets)
            # Must be checked BEFORE plural strip to avoid asset_conditions winning over equipment_assets
            if not candidates:
                candidates = [v for v in valid_tables if v.lower().endswith(used_name.lower())]

            # Case 3: used_name is plural — strip trailing 's' and retry prefix
            # (budgets → budget = prefix of budget_allocations)
            if not candidates and used_name.lower().endswith('s'):
                root = used_name[:-1]
                candidates = [v for v in valid_tables if v.lower().startswith(root.lower())]

            # Case 4: used_name ends with a valid table name (safety_incidents → incidents)
            if not candidates:
                candidates = [v for v in valid_tables if used_name.lower().endswith(v.lower())]

            if len(candidates) == 1:
                correct = candidates[0]
                result = re.sub(
                    r'\b' + re.escape(used_name) + r'\b',
                    correct,
                    result,
                    flags=re.IGNORECASE,
                )
                logger.debug(f"[fix_tables] '{used_name}' → '{correct}'")
            elif len(candidates) > 1:
                logger.warning(f"[fix_tables] ambiguous '{used_name}' → {candidates}, skipping")

        return result

    def _fix_sql_columns(self, sql: str, schema_context: Dict[str, Any]) -> str:
        """
        Post-process SQL to fix common column name mistakes from small LLMs.

        Builds the full set of valid column names from schema_context, then
        applies targeted substitutions only when the target column is valid
        and the source column is not.
        """
        if not schema_context:
            return sql

        # Collect all valid column names across all tables
        all_cols: set = set()
        for meta in schema_context.values():
            for c in meta.get("columns", []):
                name = c.get("name", "") if isinstance(c, dict) else str(c)
                if name:
                    all_cols.add(name.lower())

        logger.debug(f"[fix_columns] all_cols sample: {sorted(list(all_cols))[:20]}")

        result = sql

        # ── Boolean status patterns ───────────────────────────────────────────
        # Handle ALL quote styles: 'active', "active", `active`, active (unquoted)
        # status = 'active' → is_active = TRUE   (when is_active in schema)
        if "is_active" in all_cols:
            # Single quotes (standard SQL)
            result = re.sub(r"\bstatus\s*=\s*'active'",   "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r"\bstatus\s*=\s*'inactive'", "is_active = FALSE", result, flags=re.IGNORECASE)
            # Double quotes (sometimes generated by LLMs)
            result = re.sub(r'\bstatus\s*=\s*"active"',   "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bstatus\s*=\s*"inactive"', "is_active = FALSE", result, flags=re.IGNORECASE)
            # Backtick quotes
            result = re.sub(r"\bstatus\s*=\s*`active`",   "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r"\bstatus\s*=\s*`inactive`", "is_active = FALSE", result, flags=re.IGNORECASE)
            # Unquoted (less common but possible)
            result = re.sub(r"\bstatus\s*=\s*active\b",   "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r"\bstatus\s*=\s*inactive\b", "is_active = FALSE", result, flags=re.IGNORECASE)
            # Boolean string literals: status = 'true' / status = 'false'
            result = re.sub(r"\bstatus\s*=\s*'true'",  "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r"\bstatus\s*=\s*'false'", "is_active = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r'\bstatus\s*=\s*"true"',  "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bstatus\s*=\s*"false"', "is_active = FALSE", result, flags=re.IGNORECASE)
            # active = TRUE/FALSE → is_active = TRUE/FALSE
            result = re.sub(r'\bactive\s*=\s*TRUE\b',  'is_active = TRUE',  result, flags=re.IGNORECASE)
            result = re.sub(r'\bactive\s*=\s*FALSE\b', 'is_active = FALSE', result, flags=re.IGNORECASE)
            # WHERE active → WHERE is_active
            result = re.sub(r'\bWHERE\s+active\b', 'WHERE is_active', result, flags=re.IGNORECASE)
            # is_active = 'true'/'false' string to boolean
            result = re.sub(r"\bis_active\s*=\s*'true'",  "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r"\bis_active\s*=\s*'false'", "is_active = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r'\bis_active\s*=\s*"true"',  "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bis_active\s*=\s*"false"', "is_active = FALSE", result, flags=re.IGNORECASE)

        # status = 'resolved'/'unresolved' → is_resolved = TRUE/FALSE
        if "is_resolved" in all_cols:
            result = re.sub(r"\bstatus\s*=\s*'unresolved'", "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r"\bstatus\s*=\s*'resolved'",   "is_resolved = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bstatus\s*=\s*"unresolved"', "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r'\bstatus\s*=\s*"resolved"',   "is_resolved = TRUE",  result, flags=re.IGNORECASE)
            # Ollama sometimes uses standalone 'resolved' column
            result = re.sub(r"\bresolved\s*=\s*'false'",   "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r"\bresolved\s*=\s*'true'",    "is_resolved = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bresolved\s*=\s*"false"',   "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r'\bresolved\s*=\s*"true"',    "is_resolved = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bresolved\s*=\s*FALSE\b',   "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r'\bresolved\s*=\s*TRUE\b',    "is_resolved = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bWHERE\s+NOT\s+resolved\b', "WHERE is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r'\bWHERE\s+resolved\b',       "WHERE is_resolved = TRUE",  result, flags=re.IGNORECASE)
            # is_resolved = 'true'/'false' string to boolean
            result = re.sub(r"\bis_resolved\s*=\s*'false'", "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r"\bis_resolved\s*=\s*'true'",  "is_resolved = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r'\bis_resolved\s*=\s*"false"', "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r'\bis_resolved\s*=\s*"true"',  "is_resolved = TRUE",  result, flags=re.IGNORECASE)

        # ── Column name aliases ───────────────────────────────────────────────
        # employee_name → full_name
        if "full_name" in all_cols and "employee_name" not in all_cols:
            result = re.sub(r'\bemployee_name\b', 'full_name', result, flags=re.IGNORECASE)

        # employee_id → emp_id  (HR profile: column is emp_id not employee_id)
        if "emp_id" in all_cols and "employee_id" not in all_cols:
            result = re.sub(r'\bemployee_id\b', 'emp_id', result, flags=re.IGNORECASE)

        # salary → base_salary
        if "base_salary" in all_cols and "salary" not in all_cols:
            result = re.sub(r'\bsalary\b', 'base_salary', result, flags=re.IGNORECASE)

        # name (standalone) → full_name (only in employees context)
        if "full_name" in all_cols and "name" not in all_cols:
            # Only replace SELECT name or , name (avoid replacing table.name)
            result = re.sub(r'(?<!\.)(?<!\w)\bname\b(?!\s*\()', 'full_name', result, flags=re.IGNORECASE)

        # budget → allocated_amount  (when allocated_amount in schema)
        if "allocated_amount" in all_cols and "budget" not in all_cols:
            result = re.sub(r'\bSUM\s*\(\s*budget\s*\)', 'SUM(allocated_amount)', result, flags=re.IGNORECASE)
            result = re.sub(r'\bbudget\b(?!\s*_)', 'allocated_amount', result, flags=re.IGNORECASE)

        # vendor (bare) → vendor_name  (Procurement: no column named 'vendor')
        if "vendor_name" in all_cols and "vendor" not in all_cols:
            result = re.sub(r'\bvendor\b(?!_)', 'vendor_name', result, flags=re.IGNORECASE)

        return result

    def _direct_ollama_sql(self, db_type: str, question: str,
                           schema_context: dict) -> Optional[str]:
        """Direct Ollama call — schema DDL first, then question."""
        schema_section = ""
        if schema_context:
            ddl = self._build_schema_ddl(schema_context)
            logger.debug(f"[direct_ollama_sql] DDL {ddl}")
            if ddl:
                schema_section = (
                    "-- Schema (use ONLY these exact table and column names):\n"
                    + ddl
                    + "\n\n"
                )

        system_msg = (
            f"You are a {db_type.upper()} SQL expert. "
            "Return a single valid SELECT query using ONLY the exact table and column names "
            "defined in the CREATE TABLE statements provided. "
            "CRITICAL RULES:\n"
            "1. Use ONLY the exact column names from the DDL. Never invent column names.\n"
            "2. For BOOLEAN columns marked with '-- use: col = TRUE or col = FALSE', "
            "always use the column name directly with TRUE/FALSE, never use status='active'.\n"
            "3. Use only the exact table names shown. Never invent table names.\n"
            "Return raw SQL only — no markdown, no backticks, no explanation."
        )

        user_msg = (
            f"{schema_section}"
            f"Question: {question}\n\n"
            f"SQL:"
        )

        try:
            client = _ollama_client()
            resp = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user",   "content": user_msg},
                ],
                temperature=0,
                max_tokens=512,
            )
            raw = resp.choices[0].message.content.strip()
            logger.info(f"[ollama] raw response: {raw[:400]}")
            cleaned = self._clean_sql(raw)
            logger.info(f"[ollama] cleaned SQL: {cleaned[:400]}")
            if not cleaned.upper().startswith(("SELECT", "WITH")):
                logger.warning(f"[ollama] response not SQL: {raw[:100]}")
                return None
            return cleaned
        except Exception as e:
            logger.error(f"[ollama] failed: {e}")
            return None

    def _clean_sql(self, sql: str) -> str:
        """Strip markdown code fences and leading 'SQL:' label."""
        sql = sql.strip()
        sql = re.sub(r"^```(?:sql)?\s*", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"\s*```$", "", sql)
        sql = re.sub(r"^SQL:\s*", "", sql, flags=re.IGNORECASE)
        return sql.strip()

    # ── SQL Explanation ───────────────────────────────────────────────────────

    def explain_sql(self, sql: str, db_type: str) -> str:
        """Generate a plain English explanation of a SQL statement."""
        try:
            client = _ollama_client()
            resp = client.chat.completions.create(
                model=self.model,
                messages=[{
                    "role": "user",
                    "content": f"Explain this {db_type} SQL in plain English, briefly:\n\n{sql}",
                }],
                temperature=0.2,
                max_tokens=300,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"[ollama explain] failed: {e}")
            return "SQL explanation unavailable."

    def summarize_results(self, question: str, sql: str, results: List[Dict],
                          db_type: str) -> str:
        """Summarize query results in plain English (legacy signature)."""
        return self.summarize(question, results, len(results))

    def summarize(self, question: str, data: List[Dict], row_count: int) -> str:
        """Summarize query results in plain English.
        Called by the /summarize endpoint: engine.summarize(question, data, row_count)
        """
        try:
            results_preview = str(data[:5])
            client = _ollama_client()
            resp = client.chat.completions.create(
                model=self.model,
                messages=[{
                    "role": "user",
                    "content": (
                        f"Question: {question}\n"
                        f"Results (first 5 rows): {results_preview}\n"
                        f"Total rows: {row_count}\n\n"
                        "Provide a brief plain-English summary of the results in 1-2 sentences."
                        "Do not include any SQL or code in the summary, and do not explain the SQL query itself."
                    ),
                }],
                temperature=0.2,
                max_tokens=150,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"[ollama summarize] failed: {e}")
            return f"Query returned {row_count} row(s)."

    # ── Schema Training ───────────────────────────────────────────────────────

    def train(self, profile_id: str, db_type: str, schema_metadata: Dict[str, Any]) -> None:
        """
        Train the Vanna model on schema metadata for a given profile.
        Converts schema_metadata to DDL and stores it in memory (per-profile isolation).

        Args:
            profile_id: Unique identifier for the database profile
            db_type: Database type (postgresql, mysql, mssql, oracle, mongodb)
            schema_metadata: Dict mapping table names → {"columns": [...]}
        """
        try:
            # Build CREATE TABLE DDL from schema metadata
            ddl = self._build_schema_ddl(schema_metadata)
            if not ddl:
                logger.warning(f"[train] no DDL generated for profile {profile_id}")
                return

            # Store training data per-profile in memory
            self._instances[profile_id] = {
                "db_type": db_type,
                "schema_metadata": schema_metadata,
                "ddl": ddl,
                "timestamp": os.getenv("TIMESTAMP", ""),
            }

            logger.info(
                f"[train] profile '{profile_id}' trained on {len(schema_metadata)} tables, "
                f"DDL length: {len(ddl)} chars"
            )
        except Exception as e:
            logger.error(f"[train] failed for profile {profile_id}: {e}")
            raise

    def get_training_data(self, profile_id: str) -> Optional[str]:
        """
        Retrieve the DDL training data stored for a profile.

        Args:
            profile_id: Unique identifier for the database profile

        Returns:
            DDL string if profile has been trained, empty string otherwise
        """
        try:
            if profile_id not in self._instances:
                logger.info(f"[get_training_data] profile {profile_id} has no training data")
                return ""

            training = self._instances[profile_id]
            ddl = training.get("ddl", "")
            logger.info(f"[get_training_data] retrieved {len(ddl)} chars for profile {profile_id}")
            return ddl
        except Exception as e:
            logger.error(f"[get_training_data] failed for profile {profile_id}: {e}")
            return ""
