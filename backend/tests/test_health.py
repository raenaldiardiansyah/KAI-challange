from fastapi.testclient import TestClient

from app.main import app


def test_health_is_available_without_database_query() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "no-referrer"


def test_root_identifies_the_authentication_service() -> None:
    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "KAI RAMS Authentication API",
    }


def test_public_token_discovery_endpoints() -> None:
    with TestClient(app) as client:
        jwks_response = client.get("/.well-known/jwks.json")
        discovery_response = client.get("/.well-known/openid-configuration")
        authorization_response = client.get("/.well-known/rams-authorization.json")

    assert jwks_response.status_code == 200
    assert isinstance(jwks_response.json()["keys"], list)
    assert discovery_response.status_code == 200
    assert discovery_response.json()["issuer"]
    assert discovery_response.json()["jwks_uri"].endswith("/.well-known/jwks.json")
    assert authorization_response.status_code == 200
    assert authorization_response.json()["subject_format"] == "user_id"
    assert "users:manage" in authorization_response.json()["roles"]["ADMIN"]
