from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str | None
    name: str
    role: Literal["ADMIN", "TECHNICIAN", "VIEWER"]
    is_active: bool


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=256)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


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
