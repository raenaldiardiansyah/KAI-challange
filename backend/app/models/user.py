from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.refresh_session import RefreshSession


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('ADMIN', 'TECHNICIAN', 'VIEWER')",
            name="ck_users_role",
        ),
        CheckConstraint(
            "account_status IN ('PENDING', 'APPROVED', 'REJECTED')",
            name="ck_users_account_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))
    failed_login_attempts: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0"
    )
    last_failed_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    role: Mapped[str] = mapped_column(String(20), default="VIEWER")
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    account_status: Mapped[str] = mapped_column(
        String(20), default="APPROVED", server_default="APPROVED", index=True
    )
    approved_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    refresh_sessions: Mapped[list["RefreshSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
