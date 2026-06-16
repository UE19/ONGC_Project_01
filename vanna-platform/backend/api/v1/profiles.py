"""
Connection Profile Management endpoints.
- POST   /profiles          — create profile
- GET    /profiles          — list owned profiles
- GET    /profiles/{id}     — get profile
- PUT    /profiles/{id}     — update profile
- DELETE /profiles/{id}     — delete profile
- POST   /profiles/{id}/test — test connectivity
- GET    /profiles/{id}/schema — fetch schema
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import get_current_user, require_admin
from core.database import get_db
from core.security import encrypt_value
from middleware.audit_middleware import log_event
from models.audit_log import AuditAction
from models.connection_profile import ConnectionProfile
from models.user import User, UserRole
from schemas.connection_profile import (
    ConnectionProfileCreate, ConnectionProfileResponse, ConnectionProfileUpdate, ConnectionTestResult
)
from services.db_connector import db_connector

router = APIRouter(prefix="/profiles", tags=["Connection Profiles"])


@router.post("", response_model=ConnectionProfileResponse, status_code=201)
async def create_profile(
    body: ConnectionProfileCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = ConnectionProfile(
        owner_id=current_user.id,
        profile_name=body.profile_name,
        description=body.description,
        db_type=body.db_type,
        host=body.host,
        port=body.port,
        database_name=body.database_name,
        username=body.username,
        encrypted_password=encrypt_value(body.password),
        ssl_mode=body.ssl_mode,
        ssl_ca_cert=body.ssl_ca_cert,
        ssl_client_cert=body.ssl_client_cert,
        ssl_client_key=body.ssl_client_key,
        allowed_schemas=body.allowed_schemas,
        allowed_tables=body.allowed_tables,
        read_only=True,  # Phase-1: always read-only
    )
    db.add(profile)
    await db.flush()
    await log_event(db, AuditAction.PROFILE_CREATED, user_id=current_user.id,
                    resource_type="connection_profile", resource_id=str(profile.id),
                    ip_address=request.client.host if request.client else None)
    return profile


@router.get("", response_model=List[ConnectionProfileResponse])
async def list_profiles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
        result = await db.execute(select(ConnectionProfile).order_by(ConnectionProfile.created_at.desc()))
    else:
        result = await db.execute(
            select(ConnectionProfile).where(ConnectionProfile.owner_id == current_user.id)
        )
    return result.scalars().all()


@router.get("/{profile_id}", response_model=ConnectionProfileResponse)
async def get_profile(
    profile_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await _get_owned_profile(profile_id, current_user, db)
    return profile


@router.put("/{profile_id}", response_model=ConnectionProfileResponse)
async def update_profile(
    profile_id: uuid.UUID,
    body: ConnectionProfileUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await _get_owned_profile(profile_id, current_user, db)
    data = body.model_dump(exclude_unset=True)

    if "password" in data:
        profile.encrypted_password = encrypt_value(data.pop("password"))

    for field, val in data.items():
        if field != "read_only":  # read_only always True in Phase-1
            setattr(profile, field, val)

    await log_event(db, AuditAction.PROFILE_UPDATED, user_id=current_user.id,
                    resource_type="connection_profile", resource_id=str(profile_id),
                    ip_address=request.client.host if request.client else None)
    return profile


@router.delete("/{profile_id}", status_code=204)
async def delete_profile(
    profile_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await _get_owned_profile(profile_id, current_user, db)
    await db.delete(profile)
    await log_event(db, AuditAction.PROFILE_DELETED, user_id=current_user.id,
                    resource_type="connection_profile", resource_id=str(profile_id),
                    ip_address=request.client.host if request.client else None)


@router.post("/{profile_id}/test", response_model=ConnectionTestResult)
async def test_profile(
    profile_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    profile = await _get_owned_profile(profile_id, current_user, db)
    success, message, latency = db_connector.test_connection(profile)

    profile.last_tested_at = datetime.now(timezone.utc)
    profile.last_test_success = success

    await log_event(db, AuditAction.PROFILE_TESTED, user_id=current_user.id,
                    resource_type="connection_profile", resource_id=str(profile_id),
                    details={"success": success, "message": message},
                    ip_address=request.client.host if request.client else None)

    return ConnectionTestResult(success=success, message=message, latency_ms=latency)


@router.get("/{profile_id}/schema")
async def get_schema(
    profile_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the ingested schema metadata for a profile."""
    from models.schema_metadata import SchemaMetadata
    profile = await _get_owned_profile(profile_id, current_user, db)
    result = await db.execute(
        select(SchemaMetadata).where(SchemaMetadata.profile_id == profile_id)
    )
    rows = result.scalars().all()
    return [{"table": r.table_name, "schema": r.schema_name, "columns": r.column_definitions,
             "relationships": r.relationships} for r in rows]


# ── Helper ────────────────────────────────────────────────────────────────────
async def _get_owned_profile(
    profile_id: uuid.UUID, current_user: User, db: AsyncSession
) -> ConnectionProfile:
    result = await db.execute(select(ConnectionProfile).where(ConnectionProfile.id == profile_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if current_user.role not in (UserRole.SUPER_ADMIN, UserRole.ADMIN) and profile.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return profile
