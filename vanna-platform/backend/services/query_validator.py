"""
Query Validation & Security Layer.
Blocks all write/DDL operations. Only SELECT is permitted in Phase-1.
Implements query sanitization to prevent SQL injection.
"""
import re
from typing import Tuple

# Blocked SQL keywords — must not appear as statement-level commands
BLOCKED_KEYWORDS = {
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE",
    "EXEC", "EXECUTE", "CALL", "CREATE", "RENAME", "REPLACE",
    "MERGE", "UPSERT", "GRANT", "REVOKE", "ATTACH", "DETACH",
    "LOAD", "COPY", "BULK",
}

# Pattern for extracting the first SQL statement type
STATEMENT_PATTERN = re.compile(
    r"^\s*(?:--[^\n]*\n\s*)*(?:WITH\s+\w+\s+AS\s*\(.*?\)\s*)?([\w]+)",
    re.IGNORECASE | re.DOTALL,
)

# Dangerous patterns (SQL injection probes)
INJECTION_PATTERNS = [
    re.compile(r";\s*(?:DROP|ALTER|DELETE|UPDATE|INSERT|EXEC)", re.IGNORECASE),
    re.compile(r"--.*?(DROP|ALTER|DELETE|UPDATE|INSERT)", re.IGNORECASE),
    re.compile(r"/\*.*?\*/", re.DOTALL),  # block multiline comments
    re.compile(r"\bxp_\w+\b", re.IGNORECASE),  # MSSQL extended procedures
    re.compile(r"\bsp_\w+\b", re.IGNORECASE),  # stored procedures
    re.compile(r"\bPG_SLEEP\b|\bBENCHMARK\b|\bSLEEP\b", re.IGNORECASE),  # timing attacks
    re.compile(r"\bLOAD_FILE\b|\bINTO\s+OUTFILE\b|\bINTO\s+DUMPFILE\b", re.IGNORECASE),
    re.compile(r"\bINFORMATION_SCHEMA\b", re.IGNORECASE),  # schema probing (optional)
]


def validate_sql(sql: str, allowed_schemas: list = None, allowed_tables: list = None) -> Tuple[bool, str]:
    """
    Returns (is_valid, reason).
    Validates the generated SQL before execution.
    """
    if not sql or not sql.strip():
        return False, "Empty SQL statement"

    stripped = sql.strip()

    # 1. Check for injection patterns
    for pattern in INJECTION_PATTERNS:
        if pattern.search(stripped):
            return False, f"Potentially unsafe SQL pattern detected"

    # 2. Extract the leading statement keyword
    match = STATEMENT_PATTERN.match(stripped)
    if not match:
        return False, "Could not determine SQL statement type"

    keyword = match.group(1).upper()

    # 3. Block any non-SELECT statement
    if keyword in BLOCKED_KEYWORDS:
        return False, f"Operation '{keyword}' is not permitted. Only SELECT queries are allowed in Phase-1."

    if keyword not in ("SELECT", "WITH", "EXPLAIN", "SHOW", "DESCRIBE", "DESC"):
        return False, f"Unsupported statement type: '{keyword}'"

    # 4. Table-level access control
    if allowed_tables:
        tables_in_query = _extract_table_names(stripped)
        for t in tables_in_query:
            if t.lower() not in [at.lower() for at in allowed_tables]:
                return False, f"Access to table '{t}' is not permitted by this token"

    # 5. Schema-level access control
    if allowed_schemas:
        schemas_in_query = _extract_schema_names(stripped)
        for s in schemas_in_query:
            if s.lower() not in [as_.lower() for as_ in allowed_schemas]:
                return False, f"Access to schema '{s}' is not permitted by this token"

    return True, "OK"


def _extract_table_names(sql: str) -> list:
    """Best-effort table name extraction from FROM / JOIN clauses."""
    pattern = re.compile(
        r"\b(?:FROM|JOIN)\s+(?:[\w\"`.]+\.)?(?:[\w\"`.]+\.)?([`\"\w]+)",
        re.IGNORECASE,
    )
    return [m.group(1).strip('`"') for m in pattern.finditer(sql)]


def _extract_schema_names(sql: str) -> list:
    """Best-effort schema extraction (schema.table references).
    Ignores single-letter identifiers (table aliases like e, t, w, v).
    """
    pattern = re.compile(r"\b([`\"\w]+)\.[`\"\w]+\b", re.IGNORECASE)
    results = []
    for m in pattern.finditer(sql):
        name = m.group(1).strip('`"')
        # Skip single-char aliases and pure numbers — real schema names are multi-char
        if len(name) > 1 and not name.isdigit():
            results.append(name)
    return results


def sanitize_natural_language(question: str) -> str:
    """Strip control characters from the NL input before passing to Vanna."""
    question = question.strip()
    # Remove null bytes and control chars
    question = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", question)
    if len(question) > 2000:
        raise ValueError("Question exceeds maximum length of 2000 characters")
    return question
