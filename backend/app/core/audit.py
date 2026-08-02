from typing import Any

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.request_context import get_client_ip, get_user_agent
from app.models.audit_log import AuditLog


def add_audit_log(
    db: AsyncSession,
    request: Request,
    action: str,
    *,
    actor_user_id: int | None = None,
    target_user_id: int | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    db.add(
        AuditLog(
            actor_user_id=actor_user_id,
            target_user_id=target_user_id,
            action=action,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            details=details or {},
        )
    )
