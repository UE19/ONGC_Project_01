"""
Rate limiting middleware using Redis sliding-window counters.
Applies per-user rate limits and per-token rate limits.
"""
from fastapi import HTTPException, Request, status
from core.redis_client import increment_rate_counter
from core.config import settings
from core.http import get_client_ip


async def check_rate_limit(request: Request, identifier: str, limit: int, window: int = 60):
    """
    Generic rate limiter. Raises 429 if limit exceeded.
    identifier: unique key (user_id, token_hash, IP, etc.)
    """
    key = f"rl:{identifier}"
    count = await increment_rate_counter(key, window)
    if count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {limit} requests per {window} seconds.",
            headers={"Retry-After": str(window)},
        )


async def check_ip_rate_limit(request: Request):
    """Apply a broad IP-level rate limit to public endpoints."""
    ip = get_client_ip(request) or "unknown"
    await check_rate_limit(request, f"ip:{ip}", limit=settings.RATE_LIMIT_PER_MINUTE)


async def check_api_token_rate_limit(request: Request, token_hash: str, limit: int):
    """Apply per-token rate limit (configured on the token itself)."""
    await check_rate_limit(request, f"token:{token_hash}", limit=limit)
