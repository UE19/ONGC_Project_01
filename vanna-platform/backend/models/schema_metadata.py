"""
Schema Metadata — stores ingested schema info, business glossary, and training data
used by the Vanna AI engine.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class SchemaMetadata(Base):
    """Stores table/column metadata discovered from a connection profile."""
    __tablename__ = "schema_metadata"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connection_profiles.id"), nullable=False)

    schema_name: Mapped[str] = mapped_column(String(255), nullable=True)
    table_name: Mapped[str] = mapped_column(String(255), nullable=False)
    column_definitions: Mapped[dict] = mapped_column(JSON, default=dict)
    # e.g. {"col_name": {"type": "varchar", "nullable": true, "pk": false, "fk": null}}
    relationships: Mapped[dict] = mapped_column(JSON, default=dict)
    sample_values: Mapped[dict] = mapped_column(JSON, default=dict)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_manually_corrected: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    profile = relationship("ConnectionProfile", back_populates="schema_metadata")


class BusinessGlossary(Base):
    """Business glossary terms mapped to DB columns/tables for better NL understanding."""
    __tablename__ = "business_glossary"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("connection_profiles.id"), nullable=False)

    term: Mapped[str] = mapped_column(String(255), nullable=False)
    definition: Mapped[str] = mapped_column(Text, nullable=True)
    maps_to_table: Mapped[str] = mapped_column(String(255), nullable=True)
    maps_to_column: Mapped[str] = mapped_column(String(255), nullable=True)
    synonyms: Mapped[list] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
