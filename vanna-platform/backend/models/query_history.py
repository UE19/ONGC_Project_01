"""
Query History — detailed record of every query: NL input, generated SQL, execution results,
timings, token used, IP address.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class QueryHistory(Base):
    __tablename__ = "query_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("api_tokens.id"), nullable=True)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connection_profiles.id"), nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Query details
    natural_language_query: Mapped[str] = mapped_column(Text, nullable=False)
    generated_sql: Mapped[str] = mapped_column(Text, nullable=True)
    sql_explanation: Mapped[str] = mapped_column(Text, nullable=True)
    response_summary: Mapped[str] = mapped_column(Text, nullable=True)

    # Execution
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # success | failed | blocked
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    row_count: Mapped[int] = mapped_column(Integer, nullable=True)
    execution_time_ms: Mapped[float] = mapped_column(Float, nullable=True)

    # Request metadata
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)
    db_type: Mapped[str] = mapped_column(String(50), nullable=True)
    page: Mapped[int] = mapped_column(Integer, default=1)
    page_size: Mapped[int] = mapped_column(Integer, default=100)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    # Relationships
    token = relationship("APIToken", back_populates="query_logs")
