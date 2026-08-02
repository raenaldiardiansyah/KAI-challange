from datetime import datetime, timedelta, timezone
from math import ceil
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import case, or_, select, update
from sqlalchemy.exc import IntegrityError

from app.api.deps import AdminUser, CurrentUser, DatabaseSession
from app.core.audit import add_audit_log
from app.core.auth_protection import register_failed_login
from app.core.config import settings
from app.core.rate_limit import consume_rate_limit
from app.core.request_context import get_client_ip, get_device_name, get_user_agent
from app.core.security import (
    DUMMY_PASSWORD_HASH,
    TokenValidationError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.audit_log import AuditLog
from app.models.refresh_session import RefreshSession
from app.models.user import User
from app.schemas.auth import (
    AuditLogResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    OkResponse,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    RegistrationResponse,
    SessionResponse,
    UserCreateRequest,
    UserPasswordUpdateRequest,
    UserResponse,
    UserUpdateRequest,
)

router = APIRouter()


def invalid_credentials() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Username atau password tidak valid.",
    )


def duplicate_user() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Username atau email sudah digunakan.",
    )


def too_many_requests(retry_after_seconds: int, detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=detail,
        headers={"Retry-After": str(max(1, retry_after_seconds))},
    )


def session_values(request: Request) -> dict[str, str | None]:
    return {
        "device_name": get_device_name(request),
        "ip_address": get_client_ip(request),
        "user_agent": get_user_agent(request),
    }


async def revoke_user_sessions(user_id: int, db: DatabaseSession) -> None:
    await db.execute(
        update(RefreshSession)
        .where(
            RefreshSession.user_id == user_id,
            RefreshSession.revoked_at.is_(None),
        )
        .values(revoked_at=datetime.now(timezone.utc))
    )


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: DatabaseSession,
) -> RegistrationResponse:
    client_ip = get_client_ip(request)
    rate_limit = await consume_rate_limit(
        db,
        scope="register_ip",
        key=client_ip,
        max_requests=settings.register_ip_rate_limit,
        window=timedelta(minutes=settings.register_ip_rate_window_minutes),
        block_duration=timedelta(minutes=settings.register_ip_rate_window_minutes),
    )
    if not rate_limit.allowed:
        add_audit_log(
            db,
            request,
            "registration.rate_limited",
            details={"scope": "register_ip"},
        )
        await db.commit()
        raise too_many_requests(
            rate_limit.retry_after_seconds,
            "Terlalu banyak pendaftaran. Coba lagi nanti.",
        )

    username = payload.username.strip().lower()
    name = payload.name.strip()
    existing = await db.scalar(select(User).where(User.username == username))
    if existing is not None:
        add_audit_log(
            db,
            request,
            "registration.rejected",
            target_user_id=existing.id,
            details={"reason": "duplicate_username"},
        )
        await db.commit()
        raise duplicate_user()

    user = User(
        username=username,
        name=name,
        email=None,
        password_hash=hash_password(payload.password),
        role="TECHNICIAN",
        is_active=False,
        account_status="PENDING",
    )
    db.add(user)
    add_audit_log(
        db,
        request,
        "registration.submitted",
        details={"assigned_role": "TECHNICIAN"},
    )
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise duplicate_user() from exc

    return RegistrationResponse(
        message="Pendaftaran berhasil dan sedang menunggu persetujuan administrator.",
        username=username,
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db: DatabaseSession,
) -> LoginResponse:
    client_ip = get_client_ip(request)
    ip_rate_limit = await consume_rate_limit(
        db,
        scope="login_ip",
        key=client_ip,
        max_requests=settings.login_ip_rate_limit,
        window=timedelta(minutes=settings.login_ip_rate_window_minutes),
        block_duration=timedelta(minutes=settings.login_ip_rate_window_minutes),
    )
    if not ip_rate_limit.allowed:
        add_audit_log(
            db,
            request,
            "login.rate_limited",
            details={"scope": "login_ip"},
        )
        await db.commit()
        raise too_many_requests(
            ip_rate_limit.retry_after_seconds,
            "Terlalu banyak percobaan login. Coba lagi nanti.",
        )

    username = payload.username.strip().lower()
    user = await db.scalar(
        select(User).where(User.username == username).with_for_update()
    )
    now = datetime.now(timezone.utc)
    if user is not None and user.locked_until is not None and user.locked_until > now:
        retry_after = max(1, ceil((user.locked_until - now).total_seconds()))
        add_audit_log(
            db,
            request,
            "login.account_locked",
            target_user_id=user.id,
        )
        await db.commit()
        raise too_many_requests(
            retry_after,
            "Akun dikunci sementara karena terlalu banyak percobaan login.",
        )

    password_matches = verify_password(
        payload.password,
        user.password_hash if user is not None else DUMMY_PASSWORD_HASH,
    )
    if user is None or not password_matches:
        locked = False
        if user is not None:
            failure = register_failed_login(
                failed_attempts=user.failed_login_attempts,
                last_failed_at=user.last_failed_login_at,
                now=now,
                max_attempts=settings.login_max_failed_attempts,
                observation_window=timedelta(
                    minutes=settings.login_observation_window_minutes
                ),
                lock_duration=timedelta(minutes=settings.login_lock_minutes),
            )
            user.failed_login_attempts = failure.failed_attempts
            user.last_failed_login_at = failure.last_failed_at
            user.locked_until = failure.locked_until
            locked = failure.locked_until is not None
        add_audit_log(
            db,
            request,
            "login.failed",
            target_user_id=user.id if user else None,
            details={"account_locked": locked},
        )
        await db.commit()
        if locked:
            raise too_many_requests(
                settings.login_lock_minutes * 60,
                "Akun dikunci sementara karena terlalu banyak percobaan login.",
            )
        raise invalid_credentials()
    if not user.is_active or user.account_status != "APPROVED":
        detail = (
            "Pendaftaran akun ditolak. Hubungi administrator."
            if user.account_status == "REJECTED"
            else "Akun sedang menunggu persetujuan administrator."
        )
        add_audit_log(
            db,
            request,
            "login.denied",
            target_user_id=user.id,
            details={"account_status": user.account_status},
        )
        await db.commit()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

    user.failed_login_attempts = 0
    user.last_failed_login_at = None
    user.locked_until = None

    access_token, _, _ = create_access_token(user.id)
    refresh_token, refresh_token_id, refresh_expires_at = create_refresh_token(user.id)
    db.add(
        RefreshSession(
            user_id=user.id,
            token_id=refresh_token_id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
            **session_values(request),
        )
    )
    add_audit_log(
        db,
        request,
        "login.succeeded",
        actor_user_id=user.id,
        target_user_id=user.id,
    )
    await db.commit()

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(
    payload: RefreshRequest,
    request: Request,
    db: DatabaseSession,
) -> RefreshResponse:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token tidak valid atau sudah kedaluwarsa.",
    )
    client_ip = get_client_ip(request)
    ip_rate_limit = await consume_rate_limit(
        db,
        scope="refresh_ip",
        key=client_ip,
        max_requests=settings.refresh_ip_rate_limit,
        window=timedelta(minutes=settings.refresh_ip_rate_window_minutes),
        block_duration=timedelta(minutes=settings.refresh_ip_rate_window_minutes),
    )
    if not ip_rate_limit.allowed:
        add_audit_log(
            db,
            request,
            "session.refresh_rate_limited",
            details={"scope": "refresh_ip"},
        )
        await db.commit()
        raise too_many_requests(
            ip_rate_limit.retry_after_seconds,
            "Terlalu banyak permintaan pembaruan sesi. Coba lagi nanti.",
        )
    try:
        token_payload = decode_token(payload.refresh_token, "refresh")
        user_id = int(token_payload["sub"])
        token_id = str(token_payload["jti"])
    except (TokenValidationError, ValueError, TypeError):
        add_audit_log(db, request, "session.refresh_failed")
        await db.commit()
        raise unauthorized

    now = datetime.now(timezone.utc)
    session = await db.scalar(
        select(RefreshSession)
        .where(
            RefreshSession.user_id == user_id,
            RefreshSession.token_id == token_id,
            RefreshSession.token_hash == hash_token(payload.refresh_token),
            RefreshSession.revoked_at.is_(None),
            RefreshSession.expires_at > now,
        )
        .with_for_update()
    )
    user = await db.scalar(
        select(User).where(
            User.id == user_id,
            User.is_active.is_(True),
            User.account_status == "APPROVED",
        )
    )
    if session is None or user is None:
        add_audit_log(
            db,
            request,
            "session.refresh_failed",
            target_user_id=user_id,
        )
        await db.commit()
        raise unauthorized

    session.revoked_at = now
    session.last_used_at = now
    access_token, _, _ = create_access_token(user.id)
    refresh_token, refresh_token_id, refresh_expires_at = create_refresh_token(user.id)
    db.add(
        RefreshSession(
            user_id=user.id,
            token_id=refresh_token_id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
            device_name=session.device_name,
            ip_address=session.ip_address,
            user_agent=session.user_agent,
        )
    )
    add_audit_log(
        db,
        request,
        "session.refreshed",
        actor_user_id=user.id,
        target_user_id=user.id,
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
async def logout(
    request: Request,
    current_user: CurrentUser,
    db: DatabaseSession,
    payload: LogoutRequest | None = None,
) -> OkResponse:
    logout_all = payload is None or payload.all_sessions or not payload.refresh_token
    if logout_all:
        await revoke_user_sessions(current_user.id, db)
    else:
        await db.execute(
            update(RefreshSession)
            .where(
                RefreshSession.user_id == current_user.id,
                RefreshSession.token_hash == hash_token(payload.refresh_token),
                RefreshSession.revoked_at.is_(None),
            )
            .values(revoked_at=datetime.now(timezone.utc))
        )
    add_audit_log(
        db,
        request,
        "session.logged_out",
        actor_user_id=current_user.id,
        target_user_id=current_user.id,
        details={"all_sessions": logout_all},
    )
    await db.commit()
    return OkResponse()


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    current_user: CurrentUser,
    db: DatabaseSession,
) -> list[SessionResponse]:
    now = datetime.now(timezone.utc)
    sessions = (
        await db.scalars(
            select(RefreshSession)
            .where(
                RefreshSession.user_id == current_user.id,
                RefreshSession.revoked_at.is_(None),
                RefreshSession.expires_at > now,
            )
            .order_by(RefreshSession.last_used_at.desc(), RefreshSession.created_at.desc())
        )
    ).all()
    return [SessionResponse.model_validate(session) for session in sessions]


@router.delete("/sessions/{session_id}", response_model=OkResponse)
async def revoke_session(
    session_id: UUID,
    request: Request,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> OkResponse:
    session = await db.scalar(
        select(RefreshSession).where(
            RefreshSession.id == session_id,
            RefreshSession.user_id == current_user.id,
        )
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesi tidak ditemukan.",
        )
    session.revoked_at = datetime.now(timezone.utc)
    add_audit_log(
        db,
        request,
        "session.revoked",
        actor_user_id=current_user.id,
        target_user_id=current_user.id,
        details={"session_id": str(session_id)},
    )
    await db.commit()
    return OkResponse()


@router.get("/users", response_model=list[UserResponse])
async def list_users(_: AdminUser, db: DatabaseSession) -> list[UserResponse]:
    approval_order = case(
        (User.account_status == "PENDING", 0),
        (User.account_status == "APPROVED", 1),
        else_=2,
    )
    users = (
        await db.scalars(
            select(User).order_by(approval_order, User.created_at.desc(), User.username)
        )
    ).all()
    return [UserResponse.model_validate(user) for user in users]


@router.get("/audit-logs", response_model=list[AuditLogResponse])
async def list_audit_logs(
    _: AdminUser,
    db: DatabaseSession,
) -> list[AuditLogResponse]:
    entries = (
        await db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200))
    ).all()
    return [AuditLogResponse.model_validate(entry) for entry in entries]


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    payload: UserCreateRequest,
    request: Request,
    admin: AdminUser,
    db: DatabaseSession,
) -> UserResponse:
    username = payload.username.strip().lower()
    email = payload.email.strip().lower() if payload.email else None
    checks = [User.username == username]
    if email:
        checks.append(User.email == email)
    if await db.scalar(select(User).where(or_(*checks))) is not None:
        raise duplicate_user()

    user = User(
        username=username,
        email=email,
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=payload.is_active,
        account_status="APPROVED",
        approved_by_user_id=admin.id,
        approved_at=datetime.now(timezone.utc),
    )
    db.add(user)
    try:
        await db.flush()
        add_audit_log(
            db,
            request,
            "admin.user_created",
            actor_user_id=admin.id,
            target_user_id=user.id,
            details={"role": payload.role, "is_active": payload.is_active},
        )
        await db.commit()
        await db.refresh(user)
    except IntegrityError as exc:
        await db.rollback()
        raise duplicate_user() from exc
    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    request: Request,
    admin: AdminUser,
    db: DatabaseSession,
) -> UserResponse:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")

    protected_admin = user.username.lower() == settings.bootstrap_admin_username.lower()
    if protected_admin and (payload.role not in (None, "ADMIN") or payload.is_active is False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Akun administrator utama tidak dapat diturunkan atau dinonaktifkan.",
        )

    changes = payload.model_dump(exclude_unset=True)
    if "name" in changes and changes["name"] is not None:
        changes["name"] = changes["name"].strip()
    if changes.get("email"):
        changes["email"] = changes["email"].strip().lower()
    previous_role = user.role
    previous_active = user.is_active
    for field, value in changes.items():
        setattr(user, field, value)
    if payload.is_active is False:
        await revoke_user_sessions(user.id, db)
    add_audit_log(
        db,
        request,
        "admin.user_updated",
        actor_user_id=admin.id,
        target_user_id=user.id,
        details={
            "changed_fields": sorted(changes),
            "role_from": previous_role,
            "role_to": user.role,
            "active_from": previous_active,
            "active_to": user.is_active,
        },
    )

    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError as exc:
        await db.rollback()
        raise duplicate_user() from exc
    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}/approve", response_model=UserResponse)
async def approve_user(
    user_id: int,
    request: Request,
    admin: AdminUser,
    db: DatabaseSession,
) -> UserResponse:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")
    user.role = "TECHNICIAN"
    user.account_status = "APPROVED"
    user.is_active = True
    user.approved_by_user_id = admin.id
    user.approved_at = datetime.now(timezone.utc)
    add_audit_log(
        db,
        request,
        "admin.registration_approved",
        actor_user_id=admin.id,
        target_user_id=user.id,
        details={"assigned_role": "TECHNICIAN"},
    )
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}/reject", response_model=UserResponse)
async def reject_user(
    user_id: int,
    request: Request,
    admin: AdminUser,
    db: DatabaseSession,
) -> UserResponse:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")
    if user.username.lower() == settings.bootstrap_admin_username.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Akun administrator utama tidak dapat ditolak.",
        )
    user.account_status = "REJECTED"
    user.is_active = False
    await revoke_user_sessions(user.id, db)
    add_audit_log(
        db,
        request,
        "admin.registration_rejected",
        actor_user_id=admin.id,
        target_user_id=user.id,
    )
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}/password", response_model=OkResponse)
async def update_user_password(
    user_id: int,
    payload: UserPasswordUpdateRequest,
    request: Request,
    admin: AdminUser,
    db: DatabaseSession,
) -> OkResponse:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")
    user.password_hash = hash_password(payload.password)
    await revoke_user_sessions(user.id, db)
    add_audit_log(
        db,
        request,
        "admin.password_changed",
        actor_user_id=admin.id,
        target_user_id=user.id,
    )
    await db.commit()
    return OkResponse()
