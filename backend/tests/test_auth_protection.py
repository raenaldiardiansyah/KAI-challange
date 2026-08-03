from datetime import datetime, timedelta, timezone

from app.core.auth_protection import (
    evaluate_rate_limit,
    register_failed_login,
)

NOW = datetime(2026, 8, 3, 12, 0, tzinfo=timezone.utc)


def test_failed_login_counter_resets_after_observation_window() -> None:
    state = register_failed_login(
        failed_attempts=4,
        last_failed_at=NOW - timedelta(minutes=16),
        now=NOW,
        max_attempts=5,
        observation_window=timedelta(minutes=15),
        lock_duration=timedelta(minutes=15),
    )

    assert state.failed_attempts == 1
    assert state.locked_until is None


def test_fifth_failed_login_temporarily_locks_the_account() -> None:
    state = register_failed_login(
        failed_attempts=4,
        last_failed_at=NOW - timedelta(minutes=1),
        now=NOW,
        max_attempts=5,
        observation_window=timedelta(minutes=15),
        lock_duration=timedelta(minutes=15),
    )

    assert state.failed_attempts == 5
    assert state.locked_until == NOW + timedelta(minutes=15)


def test_rate_limit_blocks_the_request_after_the_limit() -> None:
    decision = evaluate_rate_limit(
        request_count=5,
        window_started_at=NOW - timedelta(minutes=2),
        blocked_until=None,
        now=NOW,
        max_requests=5,
        window=timedelta(minutes=10),
        block_duration=timedelta(minutes=10),
    )

    assert not decision.allowed
    assert decision.request_count == 6
    assert decision.blocked_until == NOW + timedelta(minutes=10)
    assert decision.retry_after_seconds == 600


def test_rate_limit_starts_a_fresh_window_after_expiry() -> None:
    decision = evaluate_rate_limit(
        request_count=99,
        window_started_at=NOW - timedelta(minutes=11),
        blocked_until=NOW - timedelta(seconds=1),
        now=NOW,
        max_requests=5,
        window=timedelta(minutes=10),
        block_duration=timedelta(minutes=10),
    )

    assert decision.allowed
    assert decision.request_count == 1
    assert decision.window_started_at == NOW
    assert decision.blocked_until is None
