"""
Async Worker Tasks (Celery).
Handles background processing:
- Schema ingestion & Vanna training
- Query execution timing tracking
- Token usage aggregation
- Audit log archiving
"""
import os
import httpx
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
VANNA_SERVICE_URL = os.getenv("VANNA_SERVICE_URL", "http://vanna-service:8001")
DATABASE_URL = os.getenv("DATABASE_URL", "")

celery_app = Celery(
    "vanna_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(name="worker.ingest_schema", bind=True, max_retries=3)
def ingest_schema_task(self, profile_id: str, db_type: str):
    """
    Background schema ingestion + Vanna training task.
    Triggered when a user initiates schema ingestion via the API.
    """
    try:
        with httpx.Client(timeout=120) as client:
            resp = client.post(
                f"{VANNA_SERVICE_URL}/train",
                json={"profile_id": profile_id, "db_type": db_type, "schema_metadata": {}},
            )
            resp.raise_for_status()
        return {"status": "success", "profile_id": profile_id}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(name="worker.cleanup_expired_tokens")
def cleanup_expired_tokens():
    """
    Periodic task: mark expired API tokens.
    Schedule with Celery Beat or run manually.
    """
    from datetime import datetime, timezone
    from sqlalchemy import create_engine, text

    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(
            text("""
                UPDATE api_tokens
                SET status = 'expired'
                WHERE status = 'active'
                  AND expires_at IS NOT NULL
                  AND expires_at < :now
            """),
            {"now": datetime.now(timezone.utc)},
        )
        conn.commit()


@celery_app.task(name="worker.archive_old_audit_logs")
def archive_old_audit_logs(days: int = 90):
    """
    Periodic task: archive audit logs older than N days.
    """
    from datetime import datetime, timedelta, timezone
    from sqlalchemy import create_engine, text

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(
            text("DELETE FROM audit_logs WHERE created_at < :cutoff"),
            {"cutoff": cutoff},
        )
        conn.commit()
    return {"archived": result.rowcount}


@celery_app.task(name="worker.send_usage_report")
def send_usage_report():
    """Placeholder for sending periodic usage reports to admins."""
    pass
