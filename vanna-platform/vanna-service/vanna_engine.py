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

# ── Ollama client (OpenAI-compatible, no API key needed) ──────────────────────
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434/v1")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "llama3.2")

def _ollama_client() -> OpenAI:
    return OpenAI(api_key="ollama", base_url=OLLAMA_BASE_URL)


class VannaEngine:
    """
    SQL generation engine using Ollama as the LLM backend.
    Always uses a direct Ollama call with the schema DDL provided as context.
    Post-processing corrects common table/column name errors from small models.
    """

    def __init__(self, openai_api_key: str, model: str, db_url: str):
        self.openai_api_key = openai_api_key
        self.model = OLLAMA_MODEL
        self.db_url = db_url
        self._instances: Dict[str, Any] = {}

    # ── SQL Generation ────────────────────────────────────────────────────────

    def generate_sql(self, profile_id: str, db_type: str, question: str,
                     schema_context: Optional[Dict[str, Any]] = None) -> Optional[str]:
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

        # ── Post-process: fix wrong table names, then wrong column names ──────
        sql = self._fix_sql_tables(sql, schema_ctx)
        sql = self._fix_sql_columns(sql, schema_ctx)
        return sql

    def _build_schema_ddl(self, schema_context: Dict[str, Any]) -> str:
        """Convert schema_context into CREATE TABLE DDL so Ollama sees exact names."""
        ddl_parts = []
        for table_name, meta in schema_context.items():
            cols = meta.get("columns", [])
            if not cols:
                continue
            col_lines = []
            for c in cols:
                if isinstance(c, dict):
                    col_lines.append(f"  {c.get('name', '')} {c.get('type', 'TEXT')}")
                else:
                    col_lines.append(f"  {str(c)} TEXT")
            ddl_parts.append(
                f"CREATE TABLE {table_name} (\n" + ",\n".join(col_lines) + "\n);"
            )
        return "\n\n".join(ddl_parts)

    def _fix_sql_tables(self, sql: str, schema_context: Dict[str, Any]) -> str:
        """
        Replace wrong table names with the correct ones from the schema.

        Handles four cases:
        1. Prefix:   equipment       → equipment_assets  (valid starts with used)
        2. Plural:   budgets         → budget_allocations (strip s, retry prefix)
        3. Suffix:   allocations     → budget_allocations (valid ends with used)
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

            # Case 2: used_name is plural — strip trailing 's' and retry prefix
            if not candidates and used_name.lower().endswith('s'):
                root = used_name[:-1]
                candidates = [v for v in valid_tables if v.lower().startswith(root.lower())]

            # Case 3: valid table ends with used_name (allocations → budget_allocations)
            if not candidates:
                candidates = [v for v in valid_tables if v.lower().endswith(used_name.lower())]

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
                logging.info(f"[fix_tables] '{used_name}' → '{correct}'")

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

        result = sql

        # ── Boolean status patterns ───────────────────────────────────────────
        # status = 'active' → is_active = TRUE   (when is_active in schema)
        if "is_active" in all_cols:
            result = re.sub(r"\bstatus\s*=\s*'active'",   "is_active = TRUE",  result, flags=re.IGNORECASE)
            result = re.sub(r"\bstatus\s*=\s*'inactive'", "is_active = FALSE", result, flags=re.IGNORECASE)

        # status = 'unresolved' → is_resolved = FALSE   (when is_resolved in schema)
        if "is_resolved" in all_cols:
            result = re.sub(r"\bstatus\s*=\s*'unresolved'", "is_resolved = FALSE", result, flags=re.IGNORECASE)
            result = re.sub(r"\bstatus\s*=\s*'resolved'",   "is_resolved = TRUE",  result, flags=re.IGNORECASE)

        # ── Column name aliases ───────────────────────────────────────────────
        # employee_name → full_name
        if "full_name" in all_cols and "employee_name" not in all_cols:
            result = re.sub(r'\bemployee_name\b', 'full_name', result, flags=re.IGNORECASE)

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

        # is_active → already correct, but Ollama sometimes writes "active"
        if "is_active" in all_cols:
            # active = TRUE/FALSE → is_active = TRUE/FALSE
            result = re.sub(r'\bactive\s*=\s*TRUE\b',  'is_active = TRUE',  result, flags=re.IGNORECASE)
            result = re.sub(r'\bactive\s*=\s*FALSE\b', 'is_active = FALSE', result, flags=re.IGNORECASE)
            # WHERE active → WHERE is_active (in SELECT or WHERE)
            result = re.sub(r'\bWHERE\s+active\b', 'WHERE is_active', result, flags=re.IGNORECASE)

        return result

    def _direct_ollama_sql(self, db_type: str, question: str,
                           schema_context: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Direct Ollama call — schema DDL first, then question."""
        schema_section = ""
        if schema_context:
            ddl = self._build_schema_ddl(schema_context)
            if ddl:
                schema_section = (
                    "-- Schema (use only these table/column names):\n"
                    + ddl
                    + "\n\n"
                )

        system_msg = (
            f"You are a {db_type.upper()} SQL expert. "
            "Return a single valid SELECT query using only the table and column names "
            "defined in the CREATE TABLE statements provided. "
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
                model=OLLAMA_MODEL,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user",   "content": user_msg},
                ],
                temperature=0,
                max_tokens=512,
            )
            raw = resp.choices[0].message.content.strip()
            logging.info(f"[ollama] raw response: {raw[:200]}")
            cleaned = self._clean_sql(raw)
            if not cleaned.upper().startswith(("SELECT", "WITH")):
                logging.warning(f"[ollama] response not SQL: {raw[:100]}")
                return None
            return cleaned
        except Exception as e:
            logging.error(f"[ollama] failed: {e}")
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
                model=OLLAMA_MODEL,
                messages=[{
                    "role": "user",
                    "content": f"Explain this {db_type} SQL in plain English, briefly:\n\n{sql}",
                }],
                temperature=0.2,
                max_tokens=300,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"[ollama explain] failed: {e}")
            return "SQL explanation unavailable."

    # ── Result Summarization ──────────────────────────────────────────────────

    def summarize(self, question: str, data: List[Dict], row_count: int) -> str:
        """Summarize query results in natural language."""
        data_preview = str(data[:5]) if data else "No rows returned."
        prompt = (
            f"A user asked: '{question}'\n"
            f"The query returned {row_count} row(s). First few rows: {data_preview}\n"
            f"Write a concise one-sentence summary of the result."
        )
        try:
            client = _ollama_client()
            resp = client.chat.completions.create(
                model=OLLAMA_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=150,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"[ollama summarize] failed: {e}")
            return f"Query returned {row_count} row(s)."

    # ── Schema Training ───────────────────────────────────────────────────────

    def train(self, profile_id: str, db_type: str, schema_metadata: Dict[str, Any]):
        """Train the per-profile Vanna instance on schema metadata."""
        try:
            vn = self._instances.get(profile_id)
            if vn:
                for key, table_meta in schema_metadata.items():
                    ddl = self._build_ddl(table_meta, db_type)
                    vn.train(ddl=ddl)
        except Exception as e:
            logging.warning(f"[train] failed: {e}")

    def _build_ddl(self, table_meta: dict, db_type: str) -> str:
        schema = table_meta.get("schema", "")
        table = table_meta.get("table", "unknown")
        columns = table_meta.get("columns", [])
        pks = table_meta.get("primary_keys", [])
        fks = table_meta.get("foreign_keys", [])
        table_ref = f"{schema}.{table}" if schema else table
        col_defs = []
        for col in columns:
            name = col.get("name", "col")
            dtype = col.get("type", "VARCHAR")
            nullable = "NULL" if col.get("nullable", True) else "NOT NULL"
            pk_marker = " PRIMARY KEY" if name in pks else ""
            col_defs.append(f"  {name} {dtype.upper()} {nullable}{pk_marker}")
        for fk in fks:
            col_defs.append(
                f"  FOREIGN KEY ({fk['column']}) REFERENCES {fk['references_table']}({fk['references_column']})"
            )
        col_str = ",\n".join(col_defs)
        return f"CREATE TABLE {table_ref} (\n{col_str}\n);"

    def get_training_data(self, profile_id: str) -> List[str]:
        vn = self._instances.get(profile_id)
        if not vn:
            return []
        try:
            data = vn.get_training_data()
            return [d.get("content", "") for d in data if d.get("training_data_type") == "ddl"]
        except Exception:
            return []
