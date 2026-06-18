"""
API Token Management endpoints.
- POST   /tokens                   — generate token
- GET    /tokens                   — list tokens
- GET    /tokens/{id}              — get token
- PUT    /tokens/{id}              — update token
- POST   /tokens/{id}/revoke       — revoke token
- POST   /tokens/{id}/rotate       — rotate (regenerate) token
- GET    /tokens/validate           — validate token (for external apps)
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import get_api_token, get_current_user
from core.database import get_db
from core.security import generate_api_token, hash_api_token
from middleware.audit_middleware import log_event
from models.api_token import APIToken, TokenStatus
from models.audit_log import AuditAction
from models.connection_profile import ConnectionProfile
from models.user import User, UserRole
from schemas.api_token import (
    APITokenCreate, APITokenCreatedResponse, APITokenResponse,
    APITokenUpdate, TokenValidateResponse,
)

router = APIRouter(prefix="/tokens", tags=["API Token Management"])
from core.http import get_client_ip


@router.post("", response_model=APITokenCreatedResponse, status_code=201)
async def create_token(
    body: APITokenCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify the profile belongs to the user (or admin)
    result = await db.execute(select(ConnectionProfile).where(ConnectionProfile.id == body.profile_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Connection profile not found")
    if current_user.role not in (UserRole.SUPER_ADMIN, UserRole.ADMIN) and profile.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this profile")

    raw_token, token_hash = generate_api_token()

    token = APIToken(
        owner_id=current_user.id,
        profile_id=body.profile_id,
        name=body.name,
        description=body.description,
        token_hash=token_hash,
        permissions=body.permissions,
        allowed_schemas=body.allowed_schemas,
        allowed_tables=body.allowed_tables,
        expires_at=body.expires_at,
        rate_limit_per_minute=body.rate_limit_per_minute,
    )
    db.add(token)
    await db.flush()

    await log_event(db, AuditAction.TOKEN_CREATED, user_id=current_user.id,
                    resource_type="api_token", resource_id=str(token.id),
                    ip_address=get_client_ip(request),
                    details={"name": body.name, "profile_id": str(body.profile_id)})

    response = APITokenCreatedResponse.model_validate(token)
    response.raw_token = raw_token  # shown only once
    return response


@router.get("", response_model=List[APITokenResponse])
async def list_tokens(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
        result = await db.execute(select(APIToken).order_by(APIToken.created_at.desc()))
    else:
        result = await db.execute(
            select(APIToken).where(APIToken.owner_id == current_user.id)
        )
    return result.scalars().all()


@router.get("/validate", response_model=TokenValidateResponse)
async def validate_token(
    request: Request,
    api_token: APIToken = Depends(get_api_token),
    db: AsyncSession = Depends(get_db),
):
    """External apps use this to verify their token is still valid."""
    await log_event(db, AuditAction.TOKEN_VALIDATED, resource_type="api_token",
                    resource_id=str(api_token.id),
                    ip_address=get_client_ip(request))
    return TokenValidateResponse(
        valid=True,
        token_id=api_token.id,
        profile_id=api_token.profile_id,
        db_type=api_token.profile.db_type.value if api_token.profile else None,
        permissions=api_token.permissions,
        message="Token is valid",
    )


@router.get("/{token_id}", response_model=APITokenResponse)
async def get_token(
    token_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token = await _get_owned_token(token_id, current_user, db)
    return token


@router.put("/{token_id}", response_model=APITokenResponse)
async def update_token(
    token_id: uuid.UUID,
    body: APITokenUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token = await _get_owned_token(token_id, current_user, db)
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(token, field, val)
    return token


@router.post("/{token_id}/revoke", status_code=204)
async def revoke_token(
    token_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    token = await _get_owned_token(token_id, current_user, db)
    token.status = TokenStatus.REVOKED
    token.revoked_at = datetime.now(timezone.utc)
    await log_event(db, AuditAction.TOKEN_REVOKED, user_id=current_user.id,
                    resource_type="api_token", resource_id=str(token_id),
                    ip_address=get_client_ip(request))


@router.delete("/{token_id}", status_code=204)
async def delete_token(
    token_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Permanently delete a token. Admins can delete any; owners can delete their own."""
    token = await _get_owned_token(token_id, current_user, db)
    await log_event(db, AuditAction.TOKEN_REVOKED, user_id=current_user.id,
                    resource_type="api_token", resource_id=str(token_id),
                    ip_address=get_client_ip(request),
                    details={"action": "deleted", "name": token.name})
    await db.delete(token)


@router.post("/{token_id}/rotate", response_model=APITokenCreatedResponse)
async def rotate_token(
    token_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke existing token and issue a new one with the same settings."""
    from datetime import datetime, timezone
    old_token = await _get_owned_token(token_id, current_user, db)
    old_token.status = TokenStatus.REVOKED
    old_token.revoked_at = datetime.now(timezone.utc)

    raw_token, token_hash = generate_api_token()
    new_token = APIToken(
        owner_id=old_token.owner_id,
        profile_id=old_token.profile_id,
        name=old_token.name,
        description=old_token.description,
        token_hash=token_hash,
        permissions=old_token.permissions,
        allowed_schemas=old_token.allowed_schemas,
        allowed_tables=old_token.allowed_tables,
        expires_at=old_token.expires_at,
        rate_limit_per_minute=old_token.rate_limit_per_minute,
    )
    db.add(new_token)
    await db.flush()

    await log_event(db, AuditAction.TOKEN_ROTATED, user_id=current_user.id,
                    resource_type="api_token", resource_id=str(new_token.id),
                    ip_address=get_client_ip(request))

    response = APITokenCreatedResponse.model_validate(new_token)
    response.raw_token = raw_token
    return response


async def _get_owned_token(token_id, current_user, db):
    result = await db.execute(select(APIToken).where(APIToken.id == token_id))
    token = result.scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    if current_user.role not in (UserRole.SUPER_ADMIN, UserRole.ADMIN) and token.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return token
