"""
API Token — uniquely identifies user + database profile + permissions + access scope.
Token value is stored as SHA-256 hash; the raw token is shown once.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

import enum


class TokenStatus(str, enum.Enum):
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"


class APIToken(Base):
    __tablename__ = "api_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connection_profiles.id"), nullable=False)

    # Token identity
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)  # SHA-256

    # Permissions & scope (bound to the profile)
    permissions: Mapped[list] = mapped_column(JSON, default=lambda: ["query"])
    allowed_schemas: Mapped[list] = mapped_column(JSON, default=list)
    allowed_tables: Mapped[list] = mapped_column(JSON, default=list)

    # Lifecycle
    status: Mapped[TokenStatus] = mapped_column(Enum(TokenStatus, name="token_status", create_type=False, values_callable=lambda x: [e.value for e in x]), default=TokenStatus.ACTIVE)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Rate limiting
    rate_limit_per_minute: Mapped[int] = mapped_column(Integer, default=60)

    # Usage tracking
    total_requests: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_ip: Mapped[str] = mapped_column(String(45), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner = relationship("User", back_populates="api_tokens")
    profile = relationship("ConnectionProfile", back_populates="api_tokens")
    query_logs = relationship("QueryHistory", back_populates="token")
