"""
User management endpoints (admin-level).
- GET  /users            — list all users
- GET  /users/{id}       — get user by ID
- PUT  /users/{id}       — update user (role, active status)
- DELETE /users/{id}     — deactivate user
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import require_admin, require_super_admin, get_current_user
from core.database import get_db
from core.security import hash_password
from middleware.audit_middleware import log_event
from models.audit_log import AuditAction
from models.user import User, UserRole
from schemas.user import UserResponse, UserUpdate
from core.http import get_client_ip

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only super_admin can grant super_admin role
    if body.role == UserRole.SUPER_ADMIN and current_admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only super_admin can grant super_admin role")

    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(user, field, val)

    await log_event(db, AuditAction.USER_UPDATED, user_id=current_admin.id,
                    resource_type="user", resource_id=str(user_id),
                    ip_address=get_client_ip(request))
    return user


@router.delete("/{user_id}", status_code=204)
async def deactivate_user(
    user_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await log_event(db, AuditAction.USER_DEACTIVATED, user_id=current_admin.id,
                    resource_type="user", resource_id=str(user_id),
                    ip_address=get_client_ip(request))
