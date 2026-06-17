"""
Authentication & Authorization endpoints.
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/change-password
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import get_current_user
from core.database import get_db
from core.security import (
    create_access_token, create_refresh_token,
    decode_token, hash_password, verify_password,
)
from middleware.audit_middleware import log_event
from models.audit_log import AuditAction
from models.user import User, UserRole
from schemas.user import PasswordChange, TokenResponse, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _get_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(body: UserRegister, request: Request, db: AsyncSession = Depends(get_db)):
    # Check duplicate email / username
    existing = await db.execute(
        select(User).where((User.email == body.email) | (User.username == body.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or username already registered")

    user = User(
        email=body.email,
        username=body.username,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=UserRole.USER,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.flush()
    await log_event(db, AuditAction.USER_REGISTER, user_id=user.id, ip_address=_get_ip(request))
    return user


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user: User = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        await log_event(db, AuditAction.LOGIN_FAILED,
                        ip_address=_get_ip(request), details={"email": body.email}, status="failure")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    user.last_login = datetime.now(timezone.utc)
    await log_event(db, AuditAction.USER_LOGIN, user_id=user.id, ip_address=_get_ip(request))

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role.value})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing refresh token")
    token = auth.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    new_refresh = create_refresh_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=access_token, refresh_token=new_refresh,
                         user=UserResponse.model_validate(user))


@router.post("/logout", status_code=204)
async def logout(request: Request, db: AsyncSession = Depends(get_db)):
    # Blacklist handled at client side; audit the event
    await log_event(db, AuditAction.USER_LOGOUT, ip_address=_get_ip(request))
    return


@router.post("/change-password", status_code=204)
async def change_password(
    body: PasswordChange,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(body.new_password)
    await log_event(db, AuditAction.PASSWORD_CHANGED, user_id=current_user.id, ip_address=_get_ip(request))
