import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel
from models.connection_profile import DatabaseType, SSLMode


class ConnectionProfileCreate(BaseModel):
    profile_name: str
    description: Optional[str] = None
    db_type: DatabaseType
    host: str
    port: int
    database_name: str
    username: str
    password: str  # plain — will be encrypted at service layer
    ssl_mode: SSLMode = SSLMode.DISABLE
    ssl_ca_cert: Optional[str] = None
    ssl_client_cert: Optional[str] = None
    ssl_client_key: Optional[str] = None
    allowed_schemas: List[str] = []
    allowed_tables: List[str] = []
    read_only: bool = True


class ConnectionProfileUpdate(BaseModel):
    profile_name: Optional[str] = None
    description: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    ssl_mode: Optional[SSLMode] = None
    ssl_ca_cert: Optional[str] = None
    ssl_client_cert: Optional[str] = None
    ssl_client_key: Optional[str] = None
    allowed_schemas: Optional[List[str]] = None
    allowed_tables: Optional[List[str]] = None
    read_only: Optional[bool] = None
    is_active: Optional[bool] = None


class ConnectionProfileResponse(BaseModel):
    id: uuid.UUID
    profile_name: str
    description: Optional[str]
    db_type: DatabaseType
    host: str
    port: int
    database_name: str
    username: str
    ssl_mode: SSLMode
    allowed_schemas: List[str]
    allowed_tables: List[str]
    read_only: bool
    is_active: bool
    last_tested_at: Optional[datetime]
    last_test_success: Optional[bool]
    schema_ingested_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConnectionTestResult(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float] = None
