import base64

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from app.core.config import settings
from app.core.jwks import build_jwks
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
    access, _, _ = create_access_token(7, "operator_kai", "ADMIN")
    refresh, _, _ = create_refresh_token(7)

    access_payload = decode_token(access, expected_type="access")
    assert access_payload["sub"] == "7"
    assert access_payload["username"] == "operator_kai"
    assert access_payload["role"] == "ADMIN"
    assert access_payload["iss"]
    assert access_payload["aud"]
    assert "users:manage" in access_payload["permissions"]
    assert decode_token(refresh, expected_type="refresh")["sub"] == "7"


def test_rs256_access_token_can_be_verified_from_public_jwks(monkeypatch) -> None:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    monkeypatch.setattr(
        settings,
        "jwt_access_private_key_b64",
        base64.b64encode(private_pem).decode("ascii"),
    )
    monkeypatch.setattr(
        settings,
        "jwt_access_public_key_b64",
        base64.b64encode(public_pem).decode("ascii"),
    )

    access, _, _ = create_access_token(8, "teknisi_8", "TECHNICIAN")
    header = jwt.get_unverified_header(access)
    jwks = build_jwks()

    assert header["alg"] == "RS256"
    assert header["kid"] == settings.jwt_access_key_id
    assert jwks["keys"][0]["kid"] == settings.jwt_access_key_id
    assert decode_token(access, expected_type="access")["role"] == "TECHNICIAN"
