from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app.api.deps import CurrentUser, DatabaseSession
from app.core.config import settings
from app.core.security import (
    TokenValidationError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_token,
    verify_password,
)
from app.models.refresh_session import RefreshSession
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    OkResponse,
    RefreshRequest,
    RefreshResponse,
    UserResponse,
)

router = APIRouter()


def invalid_credentials() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Username atau password tidak valid.",
    )


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: DatabaseSession) -> LoginResponse:
    username = payload.username.strip().lower()
    user = await db.scalar(select(User).where(User.username == username))
    if (
        user is None
        or not user.is_active
        or not verify_password(payload.password, user.password_hash)
    ):
        raise invalid_credentials()

    access_token, _, _ = create_access_token(user.id)
    refresh_token, refresh_token_id, refresh_expires_at = create_refresh_token(user.id)
    db.add(
        RefreshSession(
            user_id=user.id,
            token_id=refresh_token_id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
        )
    )
    await db.commit()

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(payload: RefreshRequest, db: DatabaseSession) -> RefreshResponse:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token tidak valid atau sudah kedaluwarsa.",
    )
    try:
        token_payload = decode_token(payload.refresh_token, "refresh")
        user_id = int(token_payload["sub"])
        token_id = str(token_payload["jti"])
    except (TokenValidationError, ValueError, TypeError):
        raise unauthorized

    now = datetime.now(timezone.utc)
    session = await db.scalar(
        select(RefreshSession).where(
            RefreshSession.user_id == user_id,
            RefreshSession.token_id == token_id,
            RefreshSession.token_hash == hash_token(payload.refresh_token),
            RefreshSession.revoked_at.is_(None),
            RefreshSession.expires_at > now,
        )
    )
    user = await db.scalar(
        select(User).where(User.id == user_id, User.is_active.is_(True))
    )
    if session is None or user is None:
        raise unauthorized

    session.revoked_at = now
    access_token, _, _ = create_access_token(user.id)
    refresh_token, refresh_token_id, refresh_expires_at = create_refresh_token(user.id)
    db.add(
        RefreshSession(
            user_id=user.id,
            token_id=refresh_token_id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
        )
    )
    await db.commit()

    return RefreshResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=OkResponse)
async def logout(current_user: CurrentUser, db: DatabaseSession) -> OkResponse:
    await db.execute(
        update(RefreshSession)
        .where(
            RefreshSession.user_id == current_user.id,
            RefreshSession.revoked_at.is_(None),
        )
        .values(revoked_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return OkResponse()
