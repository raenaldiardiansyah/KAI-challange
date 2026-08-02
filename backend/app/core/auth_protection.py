from dataclasses import dataclass
from datetime import datetime, timedelta
from math import ceil


@dataclass(frozen=True)
class FailedLoginState:
    failed_attempts: int
    last_failed_at: datetime
    locked_until: datetime | None


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    request_count: int
    window_started_at: datetime
    blocked_until: datetime | None
    retry_after_seconds: int


def register_failed_login(
    *,
    failed_attempts: int,
    last_failed_at: datetime | None,
    now: datetime,
    max_attempts: int,
    observation_window: timedelta,
    lock_duration: timedelta,
) -> FailedLoginState:
    within_window = (
        last_failed_at is not None and now - last_failed_at <= observation_window
    )
    next_attempts = failed_attempts + 1 if within_window else 1
    locked_until = now + lock_duration if next_attempts >= max_attempts else None
    return FailedLoginState(next_attempts, now, locked_until)


def evaluate_rate_limit(
    *,
    request_count: int,
    window_started_at: datetime | None,
    blocked_until: datetime | None,
    now: datetime,
    max_requests: int,
    window: timedelta,
    block_duration: timedelta,
) -> RateLimitDecision:
    if blocked_until is not None and blocked_until > now:
        return RateLimitDecision(
            allowed=False,
            request_count=request_count,
            window_started_at=window_started_at or now,
            blocked_until=blocked_until,
            retry_after_seconds=max(1, ceil((blocked_until - now).total_seconds())),
        )

    if window_started_at is None or now - window_started_at >= window:
        return RateLimitDecision(True, 1, now, None, 0)

    next_count = request_count + 1
    if next_count > max_requests:
        next_blocked_until = now + block_duration
        return RateLimitDecision(
            allowed=False,
            request_count=next_count,
            window_started_at=window_started_at,
            blocked_until=next_blocked_until,
            retry_after_seconds=max(1, ceil(block_duration.total_seconds())),
        )

    return RateLimitDecision(True, next_count, window_started_at, None, 0)
