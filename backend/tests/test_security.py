from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_is_not_plaintext() -> None:
    password = "password-demo-yang-kuat"
    encoded = hash_password(password)

    assert encoded != password
    assert verify_password(password, encoded)
    assert not verify_password("password-yang-salah", encoded)


def test_access_and_refresh_tokens_have_distinct_types() -> None:
    access, _, _ = create_access_token(7)
    refresh, _, _ = create_refresh_token(7)

    assert decode_token(access, expected_type="access")["sub"] == "7"
    assert decode_token(refresh, expected_type="refresh")["sub"] == "7"
