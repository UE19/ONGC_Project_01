"""
Multi-database connector service.
Supports: PostgreSQL, MySQL/MariaDB, MSSQL, Oracle, MongoDB (experimental).
All connections are read-only in Phase-1.
"""
import time
from typing import Any, Dict, List, Optional, Tuple

from models.connection_profile import DatabaseType, ConnectionProfile
from core.security import decrypt_value


class DBConnector:
    """Executes SQL on the target database identified by a connection profile."""

    def get_connection_string(self, profile: ConnectionProfile) -> str:
        password = decrypt_value(profile.encrypted_password)
        db_type = profile.db_type

        if db_type == DatabaseType.POSTGRESQL:
            ssl = f"?sslmode={profile.ssl_mode.value}" if profile.ssl_mode.value != "disable" else ""
            return f"postgresql+psycopg2://{profile.username}:{password}@{profile.host}:{profile.port}/{profile.database_name}{ssl}"

        elif db_type in (DatabaseType.MYSQL, DatabaseType.MARIADB):
            return f"mysql+pymysql://{profile.username}:{password}@{profile.host}:{profile.port}/{profile.database_name}"

        elif db_type == DatabaseType.MSSQL:
            return f"mssql+pymssql://{profile.username}:{password}@{profile.host}:{profile.port}/{profile.database_name}"

        elif db_type == DatabaseType.ORACLE:
            return f"oracle+oracledb://{profile.username}:{password}@{profile.host}:{profile.port}/?service_name={profile.database_name}"

        raise ValueError(f"Unsupported database type: {db_type}")

    def execute_query(
        self,
        profile: ConnectionProfile,
        sql: str,
        page: int = 1,
        page_size: int = 100,
    ) -> Dict[str, Any]:
        """
        Execute a validated SELECT query against the target database.
        Returns: {data, columns, row_count, total_rows, execution_time_ms}
        """
        from sqlalchemy import create_engine, text

        db_type = profile.db_type
        start = time.perf_counter()

        # MongoDB — handled separately
        if db_type == DatabaseType.MONGODB:
            return self._execute_mongo(profile, sql, page, page_size)

        engine = create_engine(
            self.get_connection_string(profile),
            connect_args=self._build_connect_args(profile),
            execution_options={"no_parameters": True},
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            isolation_level="AUTOCOMMIT",
        )

        with engine.connect() as conn:
            # Count total rows
            count_sql = f"SELECT COUNT(*) FROM ({sql.rstrip().rstrip(';')}) AS _count_query"
            try:
                total_rows = conn.execute(text(count_sql)).scalar()
            except Exception:
                total_rows = None
                conn.rollback()  # Reset aborted transaction before paginated query

            # Apply pagination
            offset = (page - 1) * page_size
            paginated_sql = self._apply_pagination(sql, db_type, page_size, offset)

            result = conn.execute(text(paginated_sql))
            columns = list(result.keys())
            rows = result.fetchall()

        elapsed = (time.perf_counter() - start) * 1000

        data = [dict(zip(columns, row)) for row in rows]
        # Serialize non-JSON-safe types
        data = _serialize_rows(data)

        return {
            "data": data,
            "columns": columns,
            "row_count": len(data),
            "total_rows": total_rows,
            "execution_time_ms": round(elapsed, 2),
        }

    def test_connection(self, profile: ConnectionProfile) -> Tuple[bool, str, Optional[float]]:
        """Test that the connection profile is reachable."""
        if profile.db_type == DatabaseType.MONGODB:
            return self._test_mongo(profile)

        from sqlalchemy import create_engine, text
        try:
            start = time.perf_counter()
            engine = create_engine(
                self.get_connection_string(profile),
                connect_args=self._build_connect_args(profile),
                pool_pre_ping=True,
            )
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            latency = round((time.perf_counter() - start) * 1000, 2)
            return True, "Connection successful", latency
        except Exception as e:
            return False, str(e), None

    def _build_connect_args(self, profile: ConnectionProfile) -> dict:
        args = {}
        if profile.ssl_mode.value != "disable":
            if profile.db_type == DatabaseType.POSTGRESQL:
                args["sslmode"] = profile.ssl_mode.value
                if profile.ssl_ca_cert:
                    args["sslrootcert"] = profile.ssl_ca_cert
        return args

    def _apply_pagination(self, sql: str, db_type: DatabaseType, limit: int, offset: int) -> str:
        """Wrap SQL with database-appropriate pagination."""
        # Strip trailing semicolon — breaks subquery wrapping
        sql = sql.rstrip().rstrip(";").rstrip()
        if db_type in (DatabaseType.POSTGRESQL, DatabaseType.MYSQL, DatabaseType.MARIADB, DatabaseType.MONGODB):
            return f"SELECT * FROM ({sql}) AS _paged LIMIT {limit} OFFSET {offset}"
        elif db_type == DatabaseType.MSSQL:
            return (
                f"SELECT * FROM ({sql}) AS _paged "
                f"ORDER BY (SELECT NULL) OFFSET {offset} ROWS FETCH NEXT {limit} ROWS ONLY"
            )
        elif db_type == DatabaseType.ORACLE:
            return (
                f"SELECT * FROM (SELECT _q.*, ROWNUM _rn FROM ({sql}) _q WHERE ROWNUM <= {offset + limit}) "
                f"WHERE _rn > {offset}"
            )
        return sql

    def _execute_mongo(self, profile: ConnectionProfile, pipeline_str: str, page: int, page_size: int) -> Dict:
        """MongoDB execution — handles both JSON pipelines and AI-generated SQL."""
        import json, time as _time
        from pymongo import MongoClient
        password = decrypt_value(profile.encrypted_password)
        uri = f"mongodb://{profile.username}:{password}@{profile.host}:{profile.port}/{profile.database_name}"
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        db = client[profile.database_name]
        start = _time.perf_counter()

        try:
            # Try JSON aggregation pipeline first
            try:
                pipeline = json.loads(pipeline_str)
                collection_name = pipeline.pop(0).get("$collection", "")
                collection = db[collection_name]
                offset = (page - 1) * page_size
                docs = list(collection.aggregate(pipeline))
                docs = docs[offset: offset + page_size]
            except (json.JSONDecodeError, ValueError, KeyError):
                # Fallback: AI gave us SQL — parse it into a pymongo find()
                collection_name, query_filter = _sql_to_mongo(pipeline_str)
                collection = db[collection_name]
                offset = (page - 1) * page_size
                docs = list(
                    collection.find(query_filter, {"_id": 0})
                    .skip(offset)
                    .limit(page_size)
                )

            elapsed = round((_time.perf_counter() - start) * 1000, 2)
            serialized = [_mongo_serialize(d) for d in docs]
            return {
                "data": serialized,
                "columns": list(serialized[0].keys()) if serialized else [],
                "row_count": len(serialized),
                "total_rows": len(serialized),
                "execution_time_ms": elapsed,
            }
        finally:
            client.close()

    def _test_mongo(self, profile: ConnectionProfile) -> Tuple[bool, str, Optional[float]]:
        from pymongo import MongoClient
        password = decrypt_value(profile.encrypted_password)
        uri = f"mongodb://{profile.username}:{password}@{profile.host}:{profile.port}/{profile.database_name}"
        try:
            start = time.perf_counter()
            client = MongoClient(uri, serverSelectionTimeoutMS=3000)
            client.server_info()
            latency = round((time.perf_counter() - start) * 1000, 2)
            client.close()
            return True, "MongoDB connection successful (experimental)", latency
        except Exception as e:
            return False, str(e), None


def _serialize_rows(data: list) -> list:
    """Convert non-JSON-serializable types (datetime, Decimal, bytes, etc.)."""
    import decimal
    from datetime import date, datetime

    def _val(v):
        if isinstance(v, (datetime, date)):
            return v.isoformat()
        if isinstance(v, decimal.Decimal):
            return float(v)
        if isinstance(v, bytes):
            return v.hex()
        return v

    return [{k: _val(v) for k, v in row.items()} for row in data]


def _mongo_serialize(doc: dict) -> dict:
    from bson import ObjectId
    from datetime import datetime
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result


def _sql_to_mongo(sql: str):
    """
    Parse AI-generated SQL into a (collection_name, filter_dict) tuple
    for pymongo find(). Handles simple SELECT ... FROM ... WHERE ... queries.
    """
    import re
    sql = sql.strip().rstrip(";")

    # Extract collection name from FROM clause
    from_match = re.search(r'\bFROM\s+`?\"?(\w+)`?\"?', sql, re.IGNORECASE)
    collection_name = from_match.group(1) if from_match else ""

    # Extract WHERE clause
    where_match = re.search(
        r'\bWHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|\s+OFFSET|$)',
        sql, re.IGNORECASE | re.DOTALL
    )
    query_filter = {}

    if where_match:
        where_clause = where_match.group(1).strip()
        conditions = re.split(r'\s+AND\s+', where_clause, flags=re.IGNORECASE)
        for cond in conditions:
            cond = cond.strip()
            # field = 'string value'
            m = re.match(r'(\w+)\s*=\s*[\'"]([^\'"]*)[\'"]', cond)
            if m:
                query_filter[m.group(1)] = m.group(2)
                continue
            # field = TRUE/FALSE
            m = re.match(r'(\w+)\s*=\s*(true|false)', cond, re.IGNORECASE)
            if m:
                query_filter[m.group(1)] = m.group(2).lower() == "true"
                continue
            # field = number
            m = re.match(r'(\w+)\s*=\s*(\d+(?:\.\d+)?)', cond)
            if m:
                val = m.group(2)
                query_filter[m.group(1)] = float(val) if "." in val else int(val)
                continue
            # field IS NULL / IS NOT NULL
            m = re.match(r'(\w+)\s+IS\s+(NOT\s+)?NULL', cond, re.IGNORECASE)
            if m:
                if m.group(2):
                    query_filter[m.group(1)] = {"$ne": None}
                else:
                    query_filter[m.group(1)] = None
                continue

    return collection_name, query_filter


db_connector = DBConnector()
