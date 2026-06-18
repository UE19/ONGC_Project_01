"""
Audit Logging & Monitoring endpoints.
- GET /audit/logs          — paginated audit logs (admin)
- GET /audit/query-history — query history with filters
- GET /audit/token-usage   — per-token usage summary
- GET /audit/failed-queries — failed/blocked query list
"""
from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import get_current_user, require_admin
from core.database import get_db
from models.audit_log import AuditLog, AuditAction
from models.api_token import APIToken
from models.query_history import QueryHistory
from models.connection_profile import ConnectionProfile
from models.user import User

router = APIRouter(prefix="/audit", tags=["Audit & Monitoring"])


@router.get("/logs")
async def get_audit_logs(
    page: int = 1,
    page_size: int = 50,
    action: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Full audit log with filters — admin only."""
    offset = (page - 1) * page_size
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).options(selectinload(AuditLog.user))

    if action:
        stmt = stmt.where(AuditLog.action == action)
    if user_id:
        stmt = stmt.where(AuditLog.user_id == user_id)
    if from_date:
        stmt = stmt.where(AuditLog.created_at >= from_date)
    if to_date:
        stmt = stmt.where(AuditLog.created_at <= to_date)

    count_result = await db.execute(select(func.count()).select_from(stmt.subquery()))
    total = count_result.scalar()

    result = await db.execute(stmt.offset(offset).limit(page_size))
    logs = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": str(log.id),
                "user_id": str(log.user_id) if log.user_id else None,
                "user_email": (log.user.email if getattr(log, "user", None) else None),
                "action": log.action.value,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "ip_address": log.ip_address,
                "status": log.status,
                # boolean success for frontend convenience
                "success": bool(str(log.status).lower() in ("success", "true", "completed")),
                "details": log.details,
                "created_at": log.created_at.isoformat(),
                # frontend expects `timestamp` key for the audit table
                "timestamp": log.created_at.isoformat(),
            }
            for log in logs
        ],
    }


@router.get("/query-history")
async def get_query_history(
    page: int = 1,
    page_size: int = 50,
    status: Optional[str] = None,
    profile_id: Optional[uuid.UUID] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models.user import UserRole
    offset = (page - 1) * page_size
    stmt = select(QueryHistory).order_by(QueryHistory.created_at.desc())

    if current_user.role not in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
        stmt = stmt.where(QueryHistory.user_id == current_user.id)

    if status:
        stmt = stmt.where(QueryHistory.status == status)
    if profile_id:
        stmt = stmt.where(QueryHistory.profile_id == profile_id)
    if from_date:
        stmt = stmt.where(QueryHistory.created_at >= from_date)
    if to_date:
        stmt = stmt.where(QueryHistory.created_at <= to_date)

    count_result = await db.execute(select(func.count()).select_from(stmt.subquery()))
    total = count_result.scalar()
    result = await db.execute(stmt.offset(offset).limit(page_size))
    items = result.scalars().all()

    # Fetch profile names in a single query to avoid N+1 problems
    profile_ids = {q.profile_id for q in items if getattr(q, "profile_id", None)}
    profile_map = {}
    if profile_ids:
        prof_res = await db.execute(
            select(ConnectionProfile.id, ConnectionProfile.profile_name).where(ConnectionProfile.id.in_(list(profile_ids)))
        )
        for pid, pname in prof_res.all():
            profile_map[str(pid)] = pname

    return {
        "total": total, "page": page, "page_size": page_size,
        "items": [
            {
                "id": str(q.id),
                "question": q.natural_language_query,
                "generated_sql": q.generated_sql,
                "summary": q.response_summary,
                "status": q.status,
                "error_message": q.error_message,
                "row_count": q.row_count,
                "execution_time_ms": q.execution_time_ms,
                "ip_address": q.ip_address,
                "db_type": q.db_type,
                "profile_id": str(q.profile_id) if q.profile_id else None,
                "profile_name": profile_map.get(str(q.profile_id)) if q.profile_id else None,
                "created_at": q.created_at.isoformat(),
            }
            for q in items
        ],
    }


@router.get("/token-usage")
async def token_usage_summary(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Per-token usage statistics."""
    result = await db.execute(
        select(
            APIToken.id,
            APIToken.name,
            APIToken.total_requests,
            APIToken.last_used_at,
            APIToken.last_used_ip,
            APIToken.status,
        ).order_by(APIToken.total_requests.desc())
    )
    rows = result.all()
    return [
        {
            "token_id": str(r.id),
            "name": r.name,
            "total_requests": r.total_requests,
            "last_used_at": r.last_used_at.isoformat() if r.last_used_at else None,
            "last_used_ip": r.last_used_ip,
            "status": r.status.value,
        }
        for r in rows
    ]


@router.get("/failed-queries")
async def failed_queries(
    page: int = 1,
    page_size: int = 50,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List blocked and failed queries."""
    offset = (page - 1) * page_size
    stmt = (
        select(QueryHistory)
        .where(QueryHistory.status.in_(["failed", "blocked"]))
        .order_by(QueryHistory.created_at.desc())
        .offset(offset).limit(page_size)
    )
    result = await db.execute(stmt)
    items = result.scalars().all()
    # Fetch profile names to display friendly profile names in the UI
    profile_ids = {q.profile_id for q in items if getattr(q, "profile_id", None)}
    profile_map = {}
    if profile_ids:
        prof_res = await db.execute(
            select(ConnectionProfile.id, ConnectionProfile.profile_name).where(ConnectionProfile.id.in_(list(profile_ids)))
        )
        for pid, pname in prof_res.all():
            profile_map[str(pid)] = pname

    return [
        {
            "id": str(q.id),
            "question": q.natural_language_query,
            "generated_sql": q.generated_sql,
            "status": q.status,
            "error_message": q.error_message,
            "ip_address": q.ip_address,
            "db_type": q.db_type,
            "profile_id": str(q.profile_id) if q.profile_id else None,
            "profile_name": profile_map.get(str(q.profile_id)) if q.profile_id else None,
            "created_at": q.created_at.isoformat(),
        }
        for q in items
    ]
