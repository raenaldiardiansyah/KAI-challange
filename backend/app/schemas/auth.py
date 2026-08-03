from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

UserRole = Literal["ADMIN", "TECHNICIAN", "VIEWER"]
AccountStatus = Literal["PENDING", "APPROVED", "REJECTED"]


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str | None
    name: str
    role: UserRole
    is_active: bool
    account_status: AccountStatus


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9._-]+$",
    )
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=12, max_length=256)


class RegistrationResponse(BaseModel):
    ok: Literal[True] = True
    message: str
    username: str
    account_status: Literal["PENDING"] = "PENDING"


class UserCreateRequest(RegisterRequest):
    email: str | None = Field(default=None, max_length=255)
    role: UserRole = "TECHNICIAN"
    is_active: bool = True


class UserUpdateRequest(BaseModel):
    email: str | None = Field(default=None, max_length=255)
    name: str | None = Field(default=None, min_length=2, max_length=100)
    role: UserRole | None = None
    is_active: bool | None = None


class UserPasswordUpdateRequest(BaseModel):
    password: str = Field(min_length=12, max_length=256)


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=256)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class LogoutRequest(BaseModel):
    refresh_token: str | None = Field(default=None, min_length=1)
    all_sessions: bool = False


class LoginResponse(BaseModel):
    ok: Literal[True] = True
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserResponse


class RefreshResponse(BaseModel):
    ok: Literal[True] = True
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int


class OkResponse(BaseModel):
    ok: Literal[True] = True


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    device_name: str
    ip_address: str | None
    user_agent: str | None
    created_at: datetime
    last_used_at: datetime
    expires_at: datetime


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actor_user_id: int | None
    target_user_id: int | None
    action: str
    ip_address: str | None
    user_agent: str | None
    details: dict[str, Any]
    created_at: datetime
