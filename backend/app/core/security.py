import base64
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.permissions import permissions_for_role

LEGACY_ACCESS_ALGORITHM = "HS256"
ASYMMETRIC_ACCESS_ALGORITHM = "RS256"
REFRESH_ALGORITHM = "HS256"
password_hash = PasswordHash.recommended()
DUMMY_PASSWORD_HASH = password_hash.hash("dummy-password-that-is-never-valid")


class TokenValidationError(ValueError):
    pass


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _decode_base64_key(value: str) -> str:
    try:
        return base64.b64decode(value).decode("utf-8")
    except (ValueError, UnicodeDecodeError) as exc:
        raise TokenValidationError("Konfigurasi kunci JWT tidak valid.") from exc


def access_token_algorithm() -> str:
    return (
        ASYMMETRIC_ACCESS_ALGORITHM
        if settings.uses_asymmetric_access_tokens
        else LEGACY_ACCESS_ALGORITHM
    )


def create_access_token(
    user_id: int,
    username: str,
    role: str,
) -> tuple[str, str, datetime]:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.access_token_expire_minutes)
    token_id = str(uuid.uuid4())
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "permissions": permissions_for_role(role),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "type": "access",
        "jti": token_id,
        "iat": now,
        "exp": expires_at,
    }
    algorithm = access_token_algorithm()
    signing_key = (
        _decode_base64_key(settings.jwt_access_private_key_b64)
        if settings.jwt_access_private_key_b64
        else settings.jwt_access_secret
    )
    headers = {"kid": settings.jwt_access_key_id}
    return jwt.encode(payload, signing_key, algorithm=algorithm, headers=headers), token_id, expires_at


def create_refresh_token(user_id: int) -> tuple[str, str, datetime]:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.refresh_token_expire_days)
    token_id = str(uuid.uuid4())
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "type": "refresh",
        "jti": token_id,
        "iat": now,
        "exp": expires_at,
    }
    token = jwt.encode(payload, settings.jwt_refresh_secret, algorithm=REFRESH_ALGORITHM)
    return token, token_id, expires_at


def decode_token(
    token: str, expected_type: Literal["access", "refresh"]
) -> dict[str, Any]:
    try:
        if expected_type == "access":
            algorithm = access_token_algorithm()
            verification_key = (
                _decode_base64_key(settings.jwt_access_public_key_b64)
                if settings.jwt_access_public_key_b64
                else settings.jwt_access_secret
            )
            payload = jwt.decode(
                token,
                verification_key,
                algorithms=[algorithm],
                issuer=settings.jwt_issuer,
                audience=settings.jwt_audience,
                options={
                    "require": [
                        "sub",
                        "username",
                        "role",
                        "permissions",
                        "iss",
                        "aud",
                        "type",
                        "jti",
                        "iat",
                        "exp",
                    ]
                },
            )
        else:
            payload = jwt.decode(
                token,
                settings.jwt_refresh_secret,
                algorithms=[REFRESH_ALGORITHM],
                options={"require": ["sub", "type", "jti", "iat", "exp"]},
            )
    except InvalidTokenError as exc:
        raise TokenValidationError("Token tidak valid atau sudah kedaluwarsa.") from exc

    if (
        payload.get("type") != expected_type
        or not payload.get("sub")
        or not payload.get("jti")
    ):
        raise TokenValidationError("Tipe atau isi token tidak valid.")
    return payload
