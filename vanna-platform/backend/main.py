"""
Centralized AI-Powered Database Query Intelligence Platform
FastAPI Application Entry Point
"""
import time
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from core.database import Base, engine

# Import all models so Alembic can detect them
from models import *  # noqa

# Import routers
from api.v1.auth import router as auth_router
from api.v1.users import router as users_router
from api.v1.profiles import router as profiles_router
from api.v1.tokens import router as tokens_router
from api.v1.query import router as query_router
from api.v1.schema_mgmt import router as schema_router
from api.v1.audit import router as audit_router
from api.v1.dashboard import router as dashboard_router

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Vanna Platform API", env=settings.ENVIRONMENT)
    yield
    logger.info("Shutting down Vanna Platform API")


app = FastAPI(
    title="Vanna AI Database Query Intelligence Platform",
    description=(
        "Centralized AI-powered platform for natural language querying of enterprise databases. "
        "Supports PostgreSQL, MySQL/MariaDB, MSSQL, Oracle, and MongoDB."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Response-Time-Ms"] = str(elapsed)
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        ip=request.client.host if request.client else None,
    )
    return response


# ── Exception Handlers ────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), path=request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(profiles_router, prefix=API_PREFIX)
app.include_router(tokens_router, prefix=API_PREFIX)
app.include_router(query_router, prefix="/api")       # POST /api/query (spec compliant)
app.include_router(schema_router, prefix=API_PREFIX)
app.include_router(audit_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)


# ── Health & Status ───────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "vanna-backend-api"}


@app.get("/api/v1/health/vanna", tags=["Health"])
async def vanna_health():
    from services.vanna_service import vanna_client
    ok = await vanna_client.health_check()
    return {"vanna_service": "ok" if ok else "unavailable"}
