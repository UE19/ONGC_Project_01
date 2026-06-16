"""
Redis client for caching, rate limiting, and session blacklisting.
"""
import json
from typing import Any, Optional

import redis.asyncio as aioredis

from core.config import settings

_redis: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    r = await get_redis()
    await r.setex(key, ttl, json.dumps(value))


async def cache_get(key: str) -> Optional[Any]:
    r = await get_redis()
    data = await r.get(key)
    return json.loads(data) if data else None


async def cache_delete(key: str) -> None:
    r = await get_redis()
    await r.delete(key)


async def blacklist_token(jti: str, ttl: int) -> None:
    """Add a JWT ID to the blacklist (for logout/revocation)."""
    r = await get_redis()
    await r.setex(f"blacklist:{jti}", ttl, "1")


async def is_token_blacklisted(jti: str) -> bool:
    r = await get_redis()
    return bool(await r.get(f"blacklist:{jti}"))


async def increment_rate_counter(key: str, window: int = 60) -> int:
    """Increment a sliding-window counter. Returns the new count."""
    r = await get_redis()
    pipe = r.pipeline()
    await pipe.incr(key)
    await pipe.expire(key, window)
    results = await pipe.execute()
    return results[0]
