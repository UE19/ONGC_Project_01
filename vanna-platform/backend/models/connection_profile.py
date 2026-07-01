"""
Database Connection Profile — stores all fields required to connect to a target database.
Passwords are stored encrypted using AES-256 (Fernet).
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

import enum


class DatabaseType(str, enum.Enum):
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    MARIADB = "mariadb"
    MSSQL = "mssql"
    ORACLE = "oracle"
    MONGODB = "mongodb"

class DatabaseTypeURLPrefix():
    POSTGRESQL = "postgresql+psycopg2"
    MYSQL = "mysql+pymysql"
    MSSQL = "mssql+pymssql"
    ORACLE = "oracle+oracledb"
    MONGODB = "mongodb"


class SSLMode(str, enum.Enum):
    DISABLE = "disable"
    REQUIRE = "require"
    VERIFY_CA = "verify-ca"
    VERIFY_FULL = "verify-full"


class ConnectionProfile(Base):
    __tablename__ = "connection_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Profile metadata
    profile_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Connection details
    db_type: Mapped[DatabaseType] = mapped_column(Enum(DatabaseType, name="database_type", create_type=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False)
    database_name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(255), nullable=False)
    encrypted_password: Mapped[str] = mapped_column(Text, nullable=False)  # AES-256 encrypted

    # SSL
    ssl_mode: Mapped[SSLMode] = mapped_column(Enum(SSLMode, name="ssl_mode", create_type=False, values_callable=lambda x: [e.value for e in x]), default=SSLMode.DISABLE)
    ssl_ca_cert: Mapped[str] = mapped_column(Text, nullable=True)
    ssl_client_cert: Mapped[str] = mapped_column(Text, nullable=True)
    ssl_client_key: Mapped[str] = mapped_column(Text, nullable=True)

    # Access control
    allowed_schemas: Mapped[list] = mapped_column(JSON, default=list)  # [] = all
    allowed_tables: Mapped[list] = mapped_column(JSON, default=list)   # [] = all
    read_only: Mapped[bool] = mapped_column(Boolean, default=True)     # Phase-1: always True

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_tested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    last_test_success: Mapped[bool] = mapped_column(Boolean, nullable=True)
    schema_ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner = relationship("User", back_populates="connection_profiles")
    api_tokens = relationship("APIToken", back_populates="profile", cascade="all, delete-orphan")
    schema_metadata = relationship("SchemaMetadata", back_populates="profile", cascade="all, delete-orphan")
