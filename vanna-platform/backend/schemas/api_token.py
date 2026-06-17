import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel
from models.api_token import TokenStatus


class APITokenCreate(BaseModel):
    name: str
    description: Optional[str] = None
    profile_id: uuid.UUID
    permissions: List[str] = ["query"]
    allowed_schemas: List[str] = []
    allowed_tables: List[str] = []
    expires_at: Optional[datetime] = None
    rate_limit_per_minute: int = 60


class APITokenUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None
    allowed_schemas: Optional[List[str]] = None
    allowed_tables: Optional[List[str]] = None
    expires_at: Optional[datetime] = None
    rate_limit_per_minute: Optional[int] = None


class APITokenResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    profile_id: uuid.UUID
    permissions: List[str]
    allowed_schemas: List[str]
    allowed_tables: List[str]
    status: TokenStatus
    expires_at: Optional[datetime]
    rate_limit_per_minute: int
    total_requests: int
    last_used_at: Optional[datetime]
    last_used_ip: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class APITokenCreatedResponse(APITokenResponse):
    """Returned only on creation — includes the raw token (shown once)."""
    raw_token: Optional[str] = None


class TokenValidateResponse(BaseModel):
    valid: bool
    token_id: Optional[uuid.UUID] = None
    profile_id: Optional[uuid.UUID] = None
    db_type: Optional[str] = None
    permissions: Optional[List[str]] = None
    message: str
