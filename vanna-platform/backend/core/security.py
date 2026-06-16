"""
Security utilities: JWT tokens, password hashing, field-level encryption.
All passwords stored as bcrypt hashes. DB connection passwords encrypted with AES-256 (Fernet).
"""
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from core.config import settings

# ── Password Hashing (bcrypt) ─────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Field-level Encryption (AES-256 via Fernet) ──────────────────────────────
def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    # Ensure 32-byte url-safe base64
    key_bytes = key.encode() if isinstance(key, str) else key
    return Fernet(key_bytes)


def encrypt_value(plain: str) -> str:
    """Encrypt a string (e.g., DB password) for storage."""
    f = _get_fernet()
    return f.encrypt(plain.encode()).decode()


def decrypt_value(encrypted: str) -> str:
    """Decrypt an encrypted field."""
    f = _get_fernet()
    return f.decrypt(encrypted.encode()).decode()


# ── JWT Tokens ────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# ── API Token Generation ──────────────────────────────────────────────────────
import secrets
import hashlib


def generate_api_token() -> tuple[str, str]:
    """
    Returns (raw_token, hashed_token).
    raw_token is shown once to the user; hashed_token is stored in DB.
    """
    raw = "vanna_" + secrets.token_urlsafe(40)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    return raw, hashed


def hash_api_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
