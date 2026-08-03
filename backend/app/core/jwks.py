import json

from cryptography.hazmat.primitives.serialization import load_pem_public_key
from jwt.algorithms import RSAAlgorithm

from app.core.config import settings
from app.core.security import (
    ASYMMETRIC_ACCESS_ALGORITHM,
    _decode_base64_key,
    access_token_algorithm,
)


def build_jwks() -> dict[str, list[dict[str, str]]]:
    if not settings.jwt_access_public_key_b64:
        return {"keys": []}

    public_key = load_pem_public_key(
        _decode_base64_key(settings.jwt_access_public_key_b64).encode("utf-8")
    )
    jwk = json.loads(RSAAlgorithm.to_jwk(public_key))
    jwk.update(
        {
            "kid": settings.jwt_access_key_id,
            "use": "sig",
            "alg": ASYMMETRIC_ACCESS_ALGORITHM,
        }
    )
    return {"keys": [jwk]}


def build_openid_configuration() -> dict[str, object]:
    issuer = settings.jwt_issuer.rstrip("/")
    return {
        "issuer": issuer,
        "jwks_uri": f"{issuer}/.well-known/jwks.json",
        "token_endpoint": f"{issuer}{settings.api_v1_prefix}/auth/login",
        "access_token_signing_alg_values_supported": [access_token_algorithm()],
        "claims_supported": [
            "sub",
            "username",
            "role",
            "permissions",
            "iss",
            "aud",
            "iat",
            "exp",
            "jti",
        ],
    }
