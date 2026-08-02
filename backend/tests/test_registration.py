import pytest
from pydantic import ValidationError

from app.schemas.auth import RegisterRequest, UserCreateRequest, UserUpdateRequest


def test_registration_accepts_a_valid_technician_request() -> None:
    payload = RegisterRequest(
        username="budi.teknisi",
        name="Budi Teknisi",
        password="password-kuat-123",
    )

    assert payload.username == "budi.teknisi"


def test_public_registration_rejects_role_escalation() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(
            username="penyerang",
            name="Bukan Admin",
            password="password-kuat-123",
            role="ADMIN",
        )


@pytest.mark.parametrize("username", ["ab", "budi teknisi", "budi/teknisi"])
def test_registration_rejects_an_invalid_username(username: str) -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(
            username=username,
            name="Budi Teknisi",
            password="password-kuat-123",
        )


def test_registration_requires_a_strong_password() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(
            username="budi.teknisi",
            name="Budi Teknisi",
            password="pendek",
        )


def test_admin_created_user_defaults_to_technician() -> None:
    payload = UserCreateRequest(
        username="budi.teknisi",
        name="Budi Teknisi",
        password="password-kuat-123",
    )

    assert payload.role == "TECHNICIAN"
    assert payload.is_active is True


def test_partial_user_update_keeps_unset_fields_out() -> None:
    payload = UserUpdateRequest(role="TECHNICIAN")

    assert payload.model_dump(exclude_unset=True) == {"role": "TECHNICIAN"}
