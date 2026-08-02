from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: str = "development"
    app_name: str = "KAI RAMS Authentication API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kai_auth"
    jwt_access_secret: str = "development-access-secret-change-me"
    jwt_refresh_secret: str = "development-refresh-secret-change-me"
    access_token_expire_minutes: int = Field(default=15, ge=1, le=1440)
    refresh_token_expire_days: int = Field(default=7, ge=1, le=90)
    login_max_failed_attempts: int = Field(default=5, ge=3, le=20)
    login_observation_window_minutes: int = Field(default=15, ge=1, le=1440)
    login_lock_minutes: int = Field(default=15, ge=1, le=1440)
    login_ip_rate_limit: int = Field(default=30, ge=5, le=1000)
    login_ip_rate_window_minutes: int = Field(default=15, ge=1, le=1440)
    refresh_ip_rate_limit: int = Field(default=120, ge=10, le=5000)
    refresh_ip_rate_window_minutes: int = Field(default=15, ge=1, le=1440)
    register_ip_rate_limit: int = Field(default=5, ge=1, le=100)
    register_ip_rate_window_minutes: int = Field(default=60, ge=1, le=1440)
    cors_origins: str = "http://localhost:3000"
    bootstrap_admin_username: str = "operator_kai"

    @field_validator("jwt_access_secret", "jwt_refresh_secret")
    @classmethod
    def validate_production_secret(cls, value: str, info):
        if info.data.get("app_env") == "production" and len(value) < 32:
            raise ValueError("JWT secret production minimal 32 karakter.")
        return value

    @property
    def sqlalchemy_database_url(self) -> str:
        value = self.database_url.strip()
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
