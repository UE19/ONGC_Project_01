"""
Schema Ingestion Service.
Performs automatic schema discovery, table metadata extraction, and column relationship understanding.
Supports PostgreSQL, MySQL/MariaDB, MSSQL, Oracle.
"""
from typing import Dict, List, Optional

from models.connection_profile import ConnectionProfile, DatabaseType
from core.security import decrypt_value


class SchemaIngestionService:

    def ingest(self, profile: ConnectionProfile, schemas: Optional[List[str]] = None,
               tables: Optional[List[str]] = None) -> Dict:
        """
        Discover schema structure from the target database.
        Returns: {`key`: {schema, table, columns: [...], primary_keys: [...], foreign_keys: [...]}}
        key = <table_schema>.<table_name>
        """

        db_type = profile.db_type

        if db_type == DatabaseType.POSTGRESQL:
            return self._ingest_postgresql(profile, schemas, tables)
        elif db_type in (DatabaseType.MYSQL, DatabaseType.MARIADB):
            return self._ingest_mysql(profile, schemas, tables)
        elif db_type == DatabaseType.MSSQL:
            return self._ingest_mssql(profile, schemas, tables)
        elif db_type == DatabaseType.ORACLE:
            return self._ingest_oracle(profile, schemas, tables)
        elif db_type == DatabaseType.MONGODB:
            return self._ingest_mongodb(profile, tables)
        raise ValueError(f"Unsupported database type: {db_type}")

    def _get_engine(self, profile: ConnectionProfile):
        from sqlalchemy import create_engine
        from services.db_connector import db_connector
        return create_engine(db_connector.get_connection_string(profile), pool_pre_ping=True)

    def _ingest_postgresql(self, profile, schemas, tables) -> Dict:
        from sqlalchemy import text
        engine = self._get_engine(profile)
        result = {}

        schema_filter = "AND table_schema = ANY(:schemas)" if schemas else "AND table_schema NOT IN ('pg_catalog','information_schema')"
        table_filter = "AND table_name = ANY(:tables)" if tables else ""

        with engine.connect() as conn:
            # Columns
            col_sql = f"""
                SELECT table_schema, table_name, column_name, data_type,
                       is_nullable, column_default, character_maximum_length
                FROM information_schema.columns
                WHERE 1=1 {schema_filter} {table_filter}
                ORDER BY table_schema, table_name, ordinal_position
            """
            params = {}
            if schemas:
                params["schemas"] = schemas
            if tables:
                params["tables"] = tables

            rows = conn.execute(text(col_sql), params).fetchall()
            for row in rows:
                key = f"{row.table_schema}.{row.table_name}"
                if key not in result:
                    result[key] = {"schema": row.table_schema, "table": row.table_name, "columns": [], "primary_keys": [], "foreign_keys": []}
                result[key]["columns"].append({
                    "name": row.column_name,
                    "type": row.data_type,
                    "nullable": row.is_nullable == "YES",
                    "default": row.column_default,
                    "max_length": row.character_maximum_length,
                })

            # Primary keys
            pk_sql = """
                SELECT kcu.table_schema, kcu.table_name, kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
            """
            for row in conn.execute(text(pk_sql)).fetchall():
                key = f"{row.table_schema}.{row.table_name}"
                if key in result:
                    result[key]["primary_keys"].append(row.column_name)

            # Foreign keys
            fk_sql = """
                SELECT kcu.table_schema, kcu.table_name, kcu.column_name,
                       ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
            """
            for row in conn.execute(text(fk_sql)).fetchall():
                key = f"{row.table_schema}.{row.table_name}"
                if key in result:
                    result[key]["foreign_keys"].append({
                        "column": row.column_name,
                        "references_table": row.foreign_table_name,
                        "references_column": row.foreign_column_name,
                    })

        return result

    def _ingest_mysql(self, profile, schemas, tables) -> Dict:
        from sqlalchemy import text
        engine = self._get_engine(profile)
        result = {}
        db_name = profile.database_name

        with engine.connect() as conn:
            table_filter = "AND TABLE_NAME IN :tables" if tables else ""
            col_sql = f"""
                SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE,
                       COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH, COLUMN_KEY, EXTRA
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = :db {table_filter}
                ORDER BY TABLE_NAME, ORDINAL_POSITION
            """
            params = {"db": db_name}
            if tables:
                params["tables"] = tuple(tables)

            rows = conn.execute(text(col_sql), params).fetchall()
            for row in rows:
                key = row.TABLE_NAME
                if key not in result:
                    result[key] = {"table": row.TABLE_NAME, "columns": [], "primary_keys": [], "foreign_keys": []}
                result[key]["columns"].append({
                    "name": row.COLUMN_NAME, "type": row.DATA_TYPE,
                    "nullable": row.IS_NULLABLE == "YES",
                    "pk": row.COLUMN_KEY == "PRI",
                })
                if row.COLUMN_KEY == "PRI":
                    result[key]["primary_keys"].append(row.COLUMN_NAME)

        return result

    def _ingest_mssql(self, profile, schemas, tables) -> Dict:
        from sqlalchemy import text
        engine = self._get_engine(profile)
        result = {}

        with engine.connect() as conn:
            col_sql = """
                SELECT s.name AS schema_name, t.name AS table_name, c.name AS col_name,
                       tp.name AS data_type, c.is_nullable
                FROM sys.columns c
                JOIN sys.tables t ON c.object_id = t.object_id
                JOIN sys.schemas s ON t.schema_id = s.schema_id
                JOIN sys.types tp ON c.user_type_id = tp.user_type_id
                ORDER BY s.name, t.name, c.column_id
            """
            for row in conn.execute(text(col_sql)).fetchall():
                key = f"{row.schema_name}.{row.table_name}"
                if key not in result:
                    result[key] = {"schema": row.schema_name, "table": row.table_name, "columns": [], "primary_keys": [], "foreign_keys": []}
                result[key]["columns"].append({
                    "name": row.col_name, "type": row.data_type, "nullable": bool(row.is_nullable),
                })
        return result

    def _ingest_oracle(self, profile, schemas, tables) -> Dict:
        from sqlalchemy import text
        engine = self._get_engine(profile)
        result = {}

        with engine.connect() as conn:
            rows = conn.execute(text(
                "SELECT OWNER, TABLE_NAME, COLUMN_NAME, DATA_TYPE, NULLABLE FROM ALL_TAB_COLUMNS ORDER BY OWNER, TABLE_NAME, COLUMN_ID"
            )).fetchall()
            for row in rows:
                key = f"{row.OWNER}.{row.TABLE_NAME}"
                if key not in result:
                    result[key] = {"schema": row.OWNER, "table": row.TABLE_NAME, "columns": [], "primary_keys": [], "foreign_keys": []}
                result[key]["columns"].append({
                    "name": row.COLUMN_NAME, "type": row.DATA_TYPE, "nullable": row.NULLABLE == "Y",
                })
        return result

    def _ingest_mongodb(self, profile, collections) -> Dict:
        from pymongo import MongoClient
        password = decrypt_value(profile.encrypted_password)
        uri = f"mongodb://{profile.username}:{password}@{profile.host}:{profile.port}/{profile.database_name}"
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        db = client[profile.database_name]
        result = {}
        try:
            coll_names = collections or db.list_collection_names()
            for name in coll_names:
                sample = db[name].find_one()
                result[name] = {
                    "table": name, "columns": [{"name": k, "type": type(v).__name__} for k, v in (sample or {}).items()],
                    "primary_keys": ["_id"], "foreign_keys": [],
                }
        finally:
            client.close()
        return result


schema_ingestion_service = SchemaIngestionService()
