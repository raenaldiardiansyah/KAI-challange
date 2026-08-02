"""Add user approval workflow and promote the bootstrap administrator.

Revision ID: 20260802_0002
Revises: 20260730_0001
Create Date: 2026-08-02
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260802_0002"
down_revision: str | None = "20260730_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "account_status",
            sa.String(length=20),
            server_default="APPROVED",
            nullable=False,
        ),
    )
    op.add_column(
        "users",
        sa.Column("approved_by_user_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_check_constraint(
        "ck_users_account_status",
        "users",
        "account_status IN ('PENDING', 'APPROVED', 'REJECTED')",
    )
    op.create_foreign_key(
        "fk_users_approved_by_user_id_users",
        "users",
        "users",
        ["approved_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_users_account_status",
        "users",
        ["account_status"],
        unique=False,
    )
    op.execute(
        sa.text(
            "UPDATE users SET role = 'ADMIN', is_active = true, "
            "account_status = 'APPROVED' WHERE lower(username) = 'operator_kai'"
        )
    )


def downgrade() -> None:
    op.drop_index("ix_users_account_status", table_name="users")
    op.drop_constraint(
        "fk_users_approved_by_user_id_users",
        "users",
        type_="foreignkey",
    )
    op.drop_constraint("ck_users_account_status", "users", type_="check")
    op.drop_column("users", "approved_at")
    op.drop_column("users", "approved_by_user_id")
    op.drop_column("users", "account_status")
