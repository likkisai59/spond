"""Password hashing + JWT issue/verify (python-jose, passlib bcrypt)."""
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from src.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"
TOKEN_TYPE_RESET = "reset"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    extra_claims: dict[str, Any] | None = None,
) -> tuple[str, str, datetime]:
    jti = uuid4().hex
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta
    payload: dict[str, Any] = {
        "sub": subject,
        "typ": token_type,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    if extra_claims:
        payload.update(extra_claims)
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, jti, expires_at


def create_access_token(
    user_id: str, email: str, role: str, accessible_modules: list[str]
) -> tuple[str, datetime]:
    token, _, expires_at = _create_token(
        user_id,
        TOKEN_TYPE_ACCESS,
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        {"email": email, "role": role, "modules": accessible_modules},
    )
    return token, expires_at


def create_refresh_token(user_id: str) -> tuple[str, str, datetime]:
    token, jti, expires_at = _create_token(
        user_id,
        TOKEN_TYPE_REFRESH,
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return token, jti, expires_at


def create_reset_token(user_id: str) -> tuple[str, str, datetime]:
    token, jti, expires_at = _create_token(
        user_id,
        TOKEN_TYPE_RESET,
        timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
    )
    return token, jti, expires_at


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    """Decode + validate type. Raises JWTError on any failure."""
    payload = jwt.decode(
        token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("typ") != expected_type:
        raise JWTError(f"Invalid token type, expected '{expected_type}'")
    return payload


__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "create_reset_token",
    "decode_token",
    "JWTError",
    "TOKEN_TYPE_ACCESS",
    "TOKEN_TYPE_REFRESH",
    "TOKEN_TYPE_RESET",
]
