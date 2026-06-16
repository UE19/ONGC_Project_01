"""
Audit logging helper — writes structured audit events to the database.
"""
import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from models.audit_log import AuditLog, AuditAction


async def log_event(
    db: AsyncSession,
    action: AuditAction,
    user_id: Optional[uuid.UUID] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[dict] = None,
    status: str = "success",
):
    """
    Create an audit log entry. Non-blocking — errors are silently swallowed
    so that audit failures never interrupt the main request.
    """
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {},
            status=status,
        )
        db.add(entry)
        await db.flush()
    except Exception:
        pass  # Audit errors must never surface to the caller
