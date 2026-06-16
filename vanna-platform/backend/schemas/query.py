import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class QueryRequest(BaseModel):
    question: str
    page: int = 1
    page_size: int = 100  # max 1000
    explain: bool = False  # also return SQL explanation


class QueryResponse(BaseModel):
    query_id: uuid.UUID
    question: str
    generated_sql: str
    sql_explanation: Optional[str] = None
    summary: str
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int
    total_rows: Optional[int] = None
    page: int
    page_size: int
    execution_time_ms: float
    db_type: str


class QueryHistoryResponse(BaseModel):
    id: uuid.UUID
    natural_language_query: str
    generated_sql: Optional[str]
    response_summary: Optional[str]
    status: str
    error_message: Optional[str]
    row_count: Optional[int]
    execution_time_ms: Optional[float]
    ip_address: Optional[str]
    db_type: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SchemaIngestRequest(BaseModel):
    profile_id: uuid.UUID
    schemas: Optional[List[str]] = None   # None = all
    tables: Optional[List[str]] = None    # None = all


class GlossaryTermCreate(BaseModel):
    profile_id: uuid.UUID
    term: str
    definition: Optional[str] = None
    maps_to_table: Optional[str] = None
    maps_to_column: Optional[str] = None
    synonyms: List[str] = []


class GlossaryTermResponse(GlossaryTermCreate):
    id: uuid.UUID

    model_config = {"from_attributes": True}
