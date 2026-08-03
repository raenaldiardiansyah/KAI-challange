import hashlib
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_protection import RateLimitDecision, evaluate_rate_limit
from app.models.auth_rate_limit import AuthRateLimit


def hash_rate_limit_key(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


async def consume_rate_limit(
    db: AsyncSession,
    *,
    scope: str,
    key: str,
    max_requests: int,
    window: timedelta,
    block_duration: timedelta,
    now: datetime | None = None,
) -> RateLimitDecision:
    checked_at = now or datetime.now(timezone.utc)
    key_hash = hash_rate_limit_key(key)
    record = await db.scalar(
        select(AuthRateLimit)
        .where(AuthRateLimit.scope == scope, AuthRateLimit.key_hash == key_hash)
        .with_for_update()
    )
    decision = evaluate_rate_limit(
        request_count=record.request_count if record else 0,
        window_started_at=record.window_started_at if record else None,
        blocked_until=record.blocked_until if record else None,
        now=checked_at,
        max_requests=max_requests,
        window=window,
        block_duration=block_duration,
    )

    if record is None:
        record = AuthRateLimit(
            scope=scope,
            key_hash=key_hash,
            request_count=decision.request_count,
            window_started_at=decision.window_started_at,
            blocked_until=decision.blocked_until,
        )
        db.add(record)
        try:
            await db.flush()
        except IntegrityError:
            await db.rollback()
            record = await db.scalar(
                select(AuthRateLimit)
                .where(
                    AuthRateLimit.scope == scope,
                    AuthRateLimit.key_hash == key_hash,
                )
                .with_for_update()
            )
            if record is None:
                raise
            decision = evaluate_rate_limit(
                request_count=record.request_count,
                window_started_at=record.window_started_at,
                blocked_until=record.blocked_until,
                now=checked_at,
                max_requests=max_requests,
                window=window,
                block_duration=block_duration,
            )
            record.request_count = decision.request_count
            record.window_started_at = decision.window_started_at
            record.blocked_until = decision.blocked_until
    else:
        record.request_count = decision.request_count
        record.window_started_at = decision.window_started_at
        record.blocked_until = decision.blocked_until

    await db.flush()
    return decision
