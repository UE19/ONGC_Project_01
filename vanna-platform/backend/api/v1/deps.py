"""
FastAPI dependency: extract and verify the current authenticated user from JWT.
Also provides role-based access control guards.
"""
from typing import Optional
import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import decode_token, hash_api_token
from models.api_token import APIToken, TokenStatus
from models.user import User, UserRole

from datetime import datetime, timezone

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


def require_roles(*roles: UserRole):
    async def _guard(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return _guard


require_super_admin = require_roles(UserRole.SUPER_ADMIN)
require_admin = require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
require_user = require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER)


async def get_api_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> APIToken:
    """Dependency for API-token-based access (external applications)."""
    if not credentials:
        raise HTTPException(status_code=401, detail="API token required")

    token_hash = hash_api_token(credentials.credentials)
    result = await db.execute(
        select(APIToken).where(APIToken.token_hash == token_hash)
    )
    token: Optional[APIToken] = result.scalar_one_or_none()

    if not token:
        raise HTTPException(status_code=401, detail="Invalid API token")

    if token.status == TokenStatus.REVOKED:
        raise HTTPException(status_code=401, detail="Token has been revoked")

    if token.expires_at and token.expires_at < datetime.now(timezone.utc):
        token.status = TokenStatus.EXPIRED
        raise HTTPException(status_code=401, detail="Token has expired")

    if token.status != TokenStatus.ACTIVE:
        raise HTTPException(status_code=401, detail="Token is not active")

    # Update usage tracking
    token.total_requests += 1
    token.last_used_at = datetime.now(timezone.utc)
    token.last_used_ip = request.client.host if request.client else None

    return token
