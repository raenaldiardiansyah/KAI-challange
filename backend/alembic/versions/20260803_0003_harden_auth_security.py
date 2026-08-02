"""Harden authentication, audit actions, and track device sessions.

Revision ID: 20260803_0003
Revises: 20260802_0002
Create Date: 2026-08-03
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op


revision: str = "20260803_0003"
down_revision: str | None = "20260802_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("failed_login_attempts", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "users", sa.Column("last_failed_login_at", sa.DateTime(timezone=True), nullable=True)
    )
    op.add_column(
        "users", sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index("ix_users_locked_until", "users", ["locked_until"], unique=False)

    op.add_column(
        "refresh_sessions",
        sa.Column(
            "device_name",
            sa.String(length=100),
            server_default="Perangkat tidak dikenal",
            nullable=False,
        ),
    )
    op.add_column(
        "refresh_sessions", sa.Column("ip_address", sa.String(length=64), nullable=True)
    )
    op.add_column(
        "refresh_sessions", sa.Column("user_agent", sa.String(length=255), nullable=True)
    )
    op.add_column(
        "refresh_sessions",
        sa.Column(
            "last_used_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_table(
        "auth_rate_limits",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("scope", sa.String(length=32), nullable=False),
        sa.Column("key_hash", sa.String(length=64), nullable=False),
        sa.Column("request_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("window_started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("blocked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("scope", "key_hash", name="uq_auth_rate_limits_scope_key"),
    )
    op.create_index("ix_auth_rate_limits_scope", "auth_rate_limits", ["scope"], unique=False)
    op.create_index(
        "ix_auth_rate_limits_blocked_until", "auth_rate_limits", ["blocked_until"], unique=False
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("actor_user_id", sa.Integer(), nullable=True),
        sa.Column("target_user_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["target_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"], unique=False)
    op.create_index("ix_audit_logs_target_user_id", "audit_logs", ["target_user_id"], unique=False)
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"], unique=False)
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_index("ix_audit_logs_target_user_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_user_id", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_auth_rate_limits_blocked_until", table_name="auth_rate_limits")
    op.drop_index("ix_auth_rate_limits_scope", table_name="auth_rate_limits")
    op.drop_table("auth_rate_limits")

    op.drop_column("refresh_sessions", "last_used_at")
    op.drop_column("refresh_sessions", "user_agent")
    op.drop_column("refresh_sessions", "ip_address")
    op.drop_column("refresh_sessions", "device_name")

    op.drop_index("ix_users_locked_until", table_name="users")
    op.drop_column("users", "locked_until")
    op.drop_column("users", "last_failed_login_at")
    op.drop_column("users", "failed_login_attempts")
