"""
Query API — the primary endpoint consumed by external applications.
POST /api/query  (Bearer: API token)
Also provides query history, CSV/Excel export, and direct SQL preview.
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.deps import get_api_token, get_current_user
from core.database import get_db, AsyncSessionLocal
from middleware.audit_middleware import log_event
from middleware.rate_limiter import check_api_token_rate_limit
from models.api_token import APIToken
from models.audit_log import AuditAction
from models.connection_profile import ConnectionProfile
from models.query_history import QueryHistory
from models.schema_metadata import SchemaMetadata
from models.user import User
from schemas.query import QueryRequest, QueryResponse, QueryHistoryResponse
from services.db_connector import db_connector
from services.export_service import to_csv, to_excel
from services.query_validator import sanitize_natural_language, validate_sql
from services.vanna_service import vanna_client

router = APIRouter(prefix="/query", tags=["Query Engine"])


@router.post("", response_model=QueryResponse)
async def execute_query(
    body: QueryRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    api_token: APIToken = Depends(get_api_token),
):
    """
    Main query endpoint for external applications.
    Accepts: natural language question
    Returns: generated_sql, summary, data[], columns, execution_time_ms
    """
    # ── Rate limit check ──────────────────────────────────────────────────────
    await check_api_token_rate_limit(request, api_token.token_hash, api_token.rate_limit_per_minute)

    # ── Sanitize input ────────────────────────────────────────────────────────
    try:
        question = sanitize_natural_language(body.question)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ── Load connection profile ───────────────────────────────────────────────
    result = await db.execute(select(ConnectionProfile).where(ConnectionProfile.id == api_token.profile_id))
    profile: ConnectionProfile = result.scalar_one_or_none()
    if not profile or not profile.is_active:
        raise HTTPException(status_code=404, detail="Connection profile not found or inactive")

    # ── Load schema context for better SQL generation ─────────────────────────
    schema_ctx: dict = {}
    try:
        schema_rows = await db.execute(
            select(SchemaMetadata).where(SchemaMetadata.profile_id == profile.id)
        )
        for sm in schema_rows.scalars().all():
            schema_ctx[sm.table_name] = sm.column_definitions or {}
    except Exception:
        pass  # schema context is best-effort

    # ── Generate SQL via Vanna AI ─────────────────────────────────────────────
    try:
        vanna_result = await vanna_client.generate_sql(
            profile_id=str(profile.id),
            db_type=profile.db_type.value,
            question=question,
            schema_context=schema_ctx,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    generated_sql: str = vanna_result.get("sql", "")
    if not generated_sql:
        raise HTTPException(status_code=422, detail="Could not generate SQL for this question")

    # ── Validate SQL (security layer) ─────────────────────────────────────────
    is_valid, reason = validate_sql(
        generated_sql,
        allowed_schemas=api_token.allowed_schemas or profile.allowed_schemas,
        allowed_tables=api_token.allowed_tables or profile.allowed_tables,
    )
    if not is_valid:
        await _log_query(db, api_token, profile, question, generated_sql, "blocked", reason, request)
        await log_event(db, AuditAction.QUERY_BLOCKED, user_id=api_token.owner_id,
                        details={"reason": reason, "sql": generated_sql},
                        ip_address=request.client.host if request.client else None)
        raise HTTPException(status_code=403, detail=f"Query blocked: {reason}")

    # ── Execute query ─────────────────────────────────────────────────────────
    try:
        exec_result = db_connector.execute_query(
            profile, generated_sql, page=body.page, page_size=min(body.page_size, 1000)
        )
    except Exception as e:
        await _log_query(db, api_token, profile, question, generated_sql, "failed", str(e), request)
        await log_event(db, AuditAction.QUERY_FAILED, user_id=api_token.owner_id,
                        details={"error": str(e)},
                        ip_address=request.client.host if request.client else None)
        raise HTTPException(status_code=500, detail=f"Query execution failed: {str(e)}")

    # ── Generate summary ──────────────────────────────────────────────────────
    summary = await vanna_client.summarize_results(
        question, exec_result["data"], exec_result["row_count"]
    )

    # ── Optionally get explanation ────────────────────────────────────────────
    explanation = None
    if body.explain:
        explanation = await vanna_client.explain_sql(generated_sql, profile.db_type.value)

    # ── Log query ─────────────────────────────────────────────────────────────
    query_id = await _log_query(
        db, api_token, profile, question, generated_sql, "success", None, request,
        row_count=exec_result["row_count"],
        execution_time_ms=exec_result["execution_time_ms"],
        summary=summary,
        explanation=explanation,
    )
    await log_event(db, AuditAction.QUERY_EXECUTED, user_id=api_token.owner_id,
                    resource_type="query", resource_id=str(query_id),
                    ip_address=request.client.host if request.client else None)

    return QueryResponse(
        query_id=query_id,
        question=question,
        generated_sql=generated_sql,
        sql_explanation=explanation,
        summary=summary,
        data=exec_result["data"],
        columns=exec_result["columns"],
        row_count=exec_result["row_count"],
        total_rows=exec_result.get("total_rows"),
        page=body.page,
        page_size=body.page_size,
        execution_time_ms=exec_result["execution_time_ms"],
        db_type=profile.db_type.value,
    )


@router.get("/history", response_model=list[QueryHistoryResponse])
async def query_history(
    page: int = 1,
    page_size: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models.user import UserRole
    offset = (page - 1) * page_size
    if current_user.role in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
        stmt = select(QueryHistory).order_by(QueryHistory.created_at.desc()).offset(offset).limit(page_size)
    else:
        stmt = (
            select(QueryHistory)
            .where(QueryHistory.user_id == current_user.id)
            .order_by(QueryHistory.created_at.desc())
            .offset(offset).limit(page_size)
        )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{query_id}/export/csv")
async def export_csv(
    query_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    api_token: APIToken = Depends(get_api_token),
):
    """Re-execute the stored query and return CSV."""
    qh = await _get_query_history(query_id, db)
    profile = await _load_profile(qh.profile_id, db)
    exec_result = db_connector.execute_query(profile, qh.generated_sql, page_size=10000)
    csv_bytes = to_csv(exec_result["data"], exec_result["columns"])
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=query_{query_id}.csv"},
    )


@router.get("/{query_id}/export/excel")
async def export_excel(
    query_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    api_token: APIToken = Depends(get_api_token),
):
    """Re-execute the stored query and return Excel."""
    qh = await _get_query_history(query_id, db)
    profile = await _load_profile(qh.profile_id, db)
    exec_result = db_connector.execute_query(profile, qh.generated_sql, page_size=10000)
    excel_bytes = to_excel(exec_result["data"], exec_result["columns"])
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=query_{query_id}.xlsx"},
    )


# ── Helpers ───────────────────────────────────────────────────────────────────
async def _log_query(db, api_token, profile, question, sql, status, error, request,
                     row_count=None, execution_time_ms=None, summary=None, explanation=None) -> uuid.UUID:
    """
    Persist a QueryHistory row using an independent session so that failures
    in the request do not cause the log to be rolled back.
    """
    qh = QueryHistory(
        token_id=api_token.id,
        profile_id=profile.id,
        user_id=api_token.owner_id,
        natural_language_query=question,
        generated_sql=sql,
        sql_explanation=explanation,
        response_summary=summary,
        status=status,
        error_message=error,
        row_count=row_count,
        execution_time_ms=execution_time_ms,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        db_type=profile.db_type.value,
    )
    try:
        async with AsyncSessionLocal() as sess:
            try:
                sess.add(qh)
                await sess.commit()
            except Exception:
                await sess.rollback()
    except Exception:
        # audit of query history must not raise - swallow any errors
        pass
    return qh.id


async def _get_query_history(query_id, db) -> QueryHistory:
    result = await db.execute(select(QueryHistory).where(QueryHistory.id == query_id))
    qh = result.scalar_one_or_none()
    if not qh:
        raise HTTPException(status_code=404, detail="Query not found")
    return qh


async def _load_profile(profile_id, db) -> ConnectionProfile:
    result = await db.execute(select(ConnectionProfile).where(ConnectionProfile.id == profile_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return p
