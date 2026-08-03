"""Align refresh token uniqueness with the ORM model.

Revision ID: 20260803_0004
Revises: 20260803_0003
Create Date: 2026-08-03
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260803_0004"
down_revision: str | None = "20260803_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "ix_refresh_sessions_token_hash",
        "refresh_sessions",
        ["token_hash"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_refresh_sessions_token_hash", table_name="refresh_sessions")
