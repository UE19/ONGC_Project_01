"""
Vanna AI Microservice
Standalone FastAPI service handling all AI operations:
- Schema understanding & metadata ingestion
- Natural language → SQL conversion
- Query optimization hints
- SQL explanation
- Contextual response/summary generation
- Supports multiple profiles simultaneously
"""
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import structlog
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from vanna_engine import VannaEngine

logger = structlog.get_logger()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
VANNA_MODEL = os.getenv("VANNA_MODEL", "gpt-4o-mini")
DB_URL = os.getenv("SYNC_DATABASE_URL", "")

engine = VannaEngine(openai_api_key=OPENAI_API_KEY, model=VANNA_MODEL, db_url=DB_URL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Vanna AI Service starting", model=VANNA_MODEL)
    yield
    logger.info("Vanna AI Service stopping")


app = FastAPI(title="Vanna AI Service", version="1.0.0", lifespan=lifespan)


# ── Request / Response Models ─────────────────────────────────────────────────

class GenerateSQLRequest(BaseModel):
    profile_id: str
    db_type: str
    question: str
    schema_context: Dict[str, Any] = {}


class GenerateSQLResponse(BaseModel):
    sql: str
    explanation: Optional[str] = None
    confidence: float = 1.0


class ExplainSQLRequest(BaseModel):
    sql: str
    db_type: str


class SummarizeRequest(BaseModel):
    question: str
    data: List[Dict[str, Any]]
    row_count: int


class TrainRequest(BaseModel):
    profile_id: str
    db_type: str
    schema_metadata: Dict[str, Any]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "vanna-ai-service"}


@app.post("/generate-sql", response_model=GenerateSQLResponse)
async def generate_sql(body: GenerateSQLRequest):
    """
    Convert natural language question to SQL.
    Uses per-profile Vanna instance for schema-aware generation.
    """
    try:
        sql = engine.generate_sql(
            profile_id=body.profile_id,
            db_type=body.db_type,
            question=body.question,
            schema_context=body.schema_context,
        )
        if not sql:
            raise HTTPException(status_code=422, detail="Unable to generate SQL for this question")
        return GenerateSQLResponse(sql=sql)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("generate_sql_error", error=str(e), profile=body.profile_id)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain-sql")
async def explain_sql(body: ExplainSQLRequest):
    """Return a human-readable explanation of a SQL statement."""
    try:
        explanation = engine.explain_sql(body.sql, body.db_type)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summarize")
async def summarize_results(body: SummarizeRequest):
    """Generate a natural language summary of query results."""
    try:
        summary = engine.summarize(body.question, body.data, body.row_count)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train")
async def train_schema(body: TrainRequest):
    """
    Train the Vanna model on schema metadata for a given profile.
    Enables context-aware SQL generation for that database.
    """
    try:
        engine.train(body.profile_id, body.db_type, body.schema_metadata)
        return {"message": "Training completed", "profile_id": body.profile_id}
    except Exception as e:
        logger.error("training_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/profiles/{profile_id}/trained-ddl")
async def get_trained_ddl(profile_id: str):
    """Return the DDL training data stored for a profile."""
    ddl = engine.get_training_data(profile_id)
    return {"profile_id": profile_id, "ddl_count": len(ddl), "ddl": ddl}
