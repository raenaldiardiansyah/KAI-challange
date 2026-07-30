import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings

ALGORITHM = "HS256"
password_hash = PasswordHash.recommended()


class TokenValidationError(ValueError):
    pass


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _create_token(
    user_id: int,
    token_type: Literal["access", "refresh"],
    secret: str,
    expires_delta: timedelta,
) -> tuple[str, str, datetime]:
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta
    token_id = str(uuid.uuid4())
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "type": token_type,
        "jti": token_id,
        "iat": now,
        "exp": expires_at,
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM), token_id, expires_at


def create_access_token(user_id: int) -> tuple[str, str, datetime]:
    return _create_token(
        user_id,
        "access",
        settings.jwt_access_secret,
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(user_id: int) -> tuple[str, str, datetime]:
    return _create_token(
        user_id,
        "refresh",
        settings.jwt_refresh_secret,
        timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(
    token: str, expected_type: Literal["access", "refresh"]
) -> dict[str, Any]:
    secret = (
        settings.jwt_access_secret
        if expected_type == "access"
        else settings.jwt_refresh_secret
    )
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    except InvalidTokenError as exc:
        raise TokenValidationError("Token tidak valid atau sudah kedaluwarsa.") from exc

    if (
        payload.get("type") != expected_type
        or not payload.get("sub")
        or not payload.get("jti")
    ):
        raise TokenValidationError("Tipe atau isi token tidak valid.")
    return payload
