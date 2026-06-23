"""
Schema Ingestion & Training endpoints.
- POST /schema/ingest/{profile_id}         — trigger schema discovery + Vanna training
- GET  /schema/metadata/{profile_id}       — list ingested metadata
- PUT  /schema/metadata/{meta_id}          — manual correction
- POST /schema/glossary                    — add glossary term
- GET  /schema/glossary/{profile_id}       — list glossary
- DELETE /schema/glossary/{term_id}        — delete glossary term
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import get_current_user
from api.v1.profiles import _get_owned_profile
from core.database import get_db
from middleware.audit_middleware import log_event
from models.audit_log import AuditAction
from models.schema_metadata import BusinessGlossary, SchemaMetadata
from models.user import User
from schemas.query import GlossaryTermCreate, GlossaryTermResponse, SchemaIngestRequest
from services.schema_ingestion import schema_ingestion_service
from services.vanna_service import vanna_client
from core.http import get_client_ip

router = APIRouter(prefix="/schema", tags=["Schema Ingestion & Training"])


@router.post("/ingest/{profile_id}")
async def ingest_schema(
    profile_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    request: Request,
    schemas: Optional[List[str]] = None,
    tables: Optional[List[str]] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Triggers schema discovery and Vanna AI training for a connection profile.
    Runs as a background task for large schemas.
    """
    profile = await _get_owned_profile(profile_id, current_user, db)

    background_tasks.add_task(
        _run_ingestion, profile_id=profile_id, profile=profile, schemas=schemas, tables=tables
    )
    await log_event(db, AuditAction.SCHEMA_INGESTED, user_id=current_user.id,
                    resource_type="connection_profile", resource_id=str(profile_id),
                    ip_address=get_client_ip(request))
    return {"message": "Schema ingestion started", "profile_id": str(profile_id)}


async def _run_ingestion(profile_id, profile, schemas, tables):
    """Background: ingest schema and train Vanna."""
    from core.database import AsyncSessionLocal
    from datetime import datetime, timezone

    schema_data = schema_ingestion_service.ingest(profile, schemas, tables)

    async with AsyncSessionLocal() as db:
        # Upsert SchemaMetadata rows
        for key, meta in schema_data.items():
            existing = await db.execute( # checks if current metadata already exists for this db profile.
                select(SchemaMetadata).where(
                    SchemaMetadata.profile_id == profile_id,
                    SchemaMetadata.table_name == meta["table"],
                )
            )
            sm = existing.scalar_one_or_none() # check whether db.execute() returned an existing metadata record.
            if not sm: # if no existing metadata, create a new one.
                sm = SchemaMetadata(profile_id=profile_id, table_name=meta["table"])
                db.add(sm)
            # update metadata fields (both for new and existing records)
            sm.schema_name = meta.get("schema")
            sm.column_definitions = {c["name"]: c for c in meta.get("columns", [])}
            sm.relationships = {"primary_keys": meta.get("primary_keys", []),
                                "foreign_keys": meta.get("foreign_keys", [])}

        # Update profile timestamp
        from models.connection_profile import ConnectionProfile
        p_result = await db.execute(select(ConnectionProfile).where(ConnectionProfile.id == profile_id))
        p = p_result.scalar_one_or_none()
        if p:
            p.schema_ingested_at = datetime.now(timezone.utc)

        await db.commit()

    # Train Vanna
    await vanna_client.train_schema(
        profile_id=str(profile_id),
        db_type=profile.db_type.value,
        schema_metadata=schema_data,
    )


@router.get("/metadata/{profile_id}")
async def get_metadata(
    profile_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SchemaMetadata).where(SchemaMetadata.profile_id == profile_id)
    )
    rows = result.scalars().all()
    return [{"id": str(r.id), "table": r.table_name, "schema": r.schema_name,
             "columns": r.column_definitions, "relationships": r.relationships,
             "manually_corrected": r.is_manually_corrected} for r in rows]


@router.put("/metadata/{meta_id}")
async def update_metadata(
    meta_id: uuid.UUID,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(SchemaMetadata).where(SchemaMetadata.id == meta_id))
    sm = result.scalar_one_or_none()
    if not sm:
        raise HTTPException(status_code=404, detail="Metadata not found")

    if "description" in body:
        sm.description = body["description"]
    if "column_definitions" in body:
        sm.column_definitions = body["column_definitions"]
    sm.is_manually_corrected = True
    return {"message": "Metadata updated", "id": str(meta_id)}


@router.post("/glossary", response_model=GlossaryTermResponse, status_code=201)
async def add_glossary_term(
    body: GlossaryTermCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    term = BusinessGlossary(**body.model_dump())
    db.add(term)
    await db.flush()
    return term


@router.get("/glossary/{profile_id}", response_model=List[GlossaryTermResponse])
async def list_glossary(
    profile_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BusinessGlossary).where(BusinessGlossary.profile_id == profile_id)
    )
    return result.scalars().all()


@router.delete("/glossary/{term_id}", status_code=204)
async def delete_glossary_term(
    term_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(BusinessGlossary).where(BusinessGlossary.id == term_id))
    term = result.scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=404, detail="Glossary term not found")
    await db.delete(term)
