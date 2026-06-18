from typing import Optional
from fastapi import Request

from .config import settings


def _first_ip_from_xff(xff: str) -> Optional[str]:
    if not xff:
        return None
    # X-Forwarded-For: client, proxy1, proxy2
    parts = [p.strip() for p in xff.split(",") if p.strip()]
    return parts[0] if parts else None


def get_client_ip(request: Optional[Request]) -> Optional[str]:
    """Return the client IP considering X-Forwarded-For when enabled.

    Behavior:
    - If `TRUST_X_FORWARDED` is False: return the immediate remote (request.client.host)
    - If True and `TRUSTED_PROXIES` is empty: return the first IP in X-Forwarded-For if present
    - If True and `TRUSTED_PROXIES` provided: only honor XFF when immediate remote is in trusted list
    """
    if request is None:
        return None

    remote = request.client.host if request.client else None
    xff = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")

    if not xff:
        return remote

    if not settings.TRUST_X_FORWARDED:
        return remote

    trusted = settings.trusted_proxies_list
    if trusted:
        # Only honor XFF when the immediate remote is a trusted proxy
        if not remote or remote not in trusted:
            return remote

    first = _first_ip_from_xff(xff)
    return first or remote
