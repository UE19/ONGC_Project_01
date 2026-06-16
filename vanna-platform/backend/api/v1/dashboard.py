"""
Dashboard & Analytics endpoints.
Returns: active users, profile count, query stats, token usage, response timings,
most queried databases, failed query analytics.
"""
import traceback
from datetime import datetime, timedelta, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import get_current_user
from core.database import get_db
from models.api_token import APIToken, TokenStatus
from models.connection_profile import ConnectionProfile
from models.query_history import QueryHistory
from models.user import User

logger = structlog.get_logger()
router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])


async def _scalar(db: AsyncSession, stmt) -> int:
    """Execute a scalar COUNT/AVG query and return the value safely."""
    try:
        result = await db.execute(stmt)
        val = result.scalar()
        return val if val is not None else 0
    except Exception as exc:
        logger.warning("dashboard_scalar_failed", error=str(exc))
        return 0


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    try:
        now = datetime.now(timezone.utc)
        last_30_days = now - timedelta(days=30)
        last_24h = now - timedelta(hours=24)

        # ── User stats ────────────────────────────────────────────────────────
        active_users_val = await _scalar(db,
            select(func.count(User.id)).where(User.last_login >= last_30_days)
        )
        total_users_val = await _scalar(db, select(func.count(User.id)))

        # ── Profile count ─────────────────────────────────────────────────────
        profile_count_val = await _scalar(db, select(func.count(ConnectionProfile.id)))

        # ── Query statistics ──────────────────────────────────────────────────
        total_queries_val = await _scalar(db, select(func.count(QueryHistory.id)))
        queries_today_val = await _scalar(db,
            select(func.count(QueryHistory.id)).where(QueryHistory.created_at >= last_24h)
        )
        failed_queries_val = await _scalar(db,
            select(func.count(QueryHistory.id)).where(
                QueryHistory.status.in_(["failed", "blocked"])
            )
        )

        # ── Average response time ─────────────────────────────────────────────
        avg_ms_val = await _scalar(db,
            select(func.avg(QueryHistory.execution_time_ms)).where(
                QueryHistory.status == "success",
                QueryHistory.created_at >= last_30_days,
            )
        )

        # ── Token usage ────────────────────────────────────────────────────────
        total_tokens_val = await _scalar(db, select(func.count(APIToken.id)))
        active_tokens_val = await _scalar(db,
            select(func.count(APIToken.id)).where(APIToken.status == TokenStatus.ACTIVE)
        )

        # ── Most queried databases ─────────────────────────────────────────────
        top_dbs = []
        try:
            most_queried = await db.execute(
                select(QueryHistory.db_type, func.count(QueryHistory.id).label("count"))
                .where(QueryHistory.db_type.isnot(None))
                .group_by(QueryHistory.db_type)
                .order_by(func.count(QueryHistory.id).desc())
                .limit(5)
            )
            top_dbs = [
                {"db_type": str(r.db_type), "count": int(r.count)}
                for r in most_queried.all()
            ]
        except Exception as exc:
            logger.warning("dashboard_top_dbs_failed", error=str(exc))

        # ── Query volume over last 7 days ──────────────────────────────────────
        daily_counts = []
        for i in range(7):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            cnt = await _scalar(db,
                select(func.count(QueryHistory.id)).where(
                    QueryHistory.created_at >= day_start,
                    QueryHistory.created_at < day_end,
                )
            )
            daily_counts.append({
                "date": day_start.date().isoformat(),
                "count": int(cnt),
            })

        # ── Success rate (use pre-fetched scalars) ─────────────────────────────
        success_rate = _calc_success_rate(total_queries_val, failed_queries_val)

        return {
            "active_users": int(active_users_val),
            "total_users": int(total_users_val),
            "database_profile_count": int(profile_count_val),
            "total_queries": int(total_queries_val),
            "queries_today": int(queries_today_val),
            "failed_queries": int(failed_queries_val),
            "success_rate": float(success_rate),
            "avg_response_time_ms": round(float(avg_ms_val), 2) if avg_ms_val else 0,
            "total_tokens": int(total_tokens_val),
            "active_tokens": int(active_tokens_val),
            "most_queried_databases": top_dbs,
            "query_volume_last_7_days": list(reversed(daily_counts)),
        }

    except Exception as exc:
        tb = traceback.format_exc()
        logger.error("dashboard_stats_failed", error=str(exc), traceback=tb)
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(exc)}")


def _calc_success_rate(total: int, failed: int) -> float:
    if not total:
        return 100.0
    return round(((total - failed) / total) * 100, 1)
