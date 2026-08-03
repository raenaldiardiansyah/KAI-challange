import pytest
from fastapi import HTTPException

from app.api.deps import get_current_admin
from app.models.user import User


def user_with_role(role: str) -> User:
    return User(
        username=f"user-{role.lower()}",
        name="Test User",
        password_hash="not-used-in-this-test",
        role=role,
        is_active=True,
        account_status="APPROVED",
    )


@pytest.mark.asyncio
async def test_admin_dependency_accepts_only_admin_role() -> None:
    admin = user_with_role("ADMIN")
    assert await get_current_admin(admin) is admin

    with pytest.raises(HTTPException) as error:
        await get_current_admin(user_with_role("TECHNICIAN"))

    assert error.value.status_code == 403
