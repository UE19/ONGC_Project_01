"""
Audit Log — records every significant platform action.
Covers: user activity, query history, failed queries, API usage, token usage, IP tracking.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

import enum


class AuditAction(str, enum.Enum):
    # Auth
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_REGISTER = "user_register"
    LOGIN_FAILED = "login_failed"
    PASSWORD_CHANGED = "password_changed"
    # User management
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_DEACTIVATED = "user_deactivated"
    # Profile management
    PROFILE_CREATED = "profile_created"
    PROFILE_UPDATED = "profile_updated"
    PROFILE_DELETED = "profile_deleted"
    PROFILE_TESTED = "profile_tested"
    SCHEMA_INGESTED = "schema_ingested"
    # Token management
    TOKEN_CREATED = "token_created"
    TOKEN_REVOKED = "token_revoked"
    TOKEN_ROTATED = "token_rotated"
    TOKEN_VALIDATED = "token_validated"
    # Query
    QUERY_EXECUTED = "query_executed"
    QUERY_FAILED = "query_failed"
    QUERY_BLOCKED = "query_blocked"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction, name="audit_action", create_type=False, values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=True)
    resource_id: Mapped[str] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(20), default="success")  # success | failure
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    user = relationship("User", back_populates="audit_logs")
