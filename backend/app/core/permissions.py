from typing import Literal

UserRole = Literal["ADMIN", "TECHNICIAN", "VIEWER"]

ROLE_PERMISSIONS: dict[UserRole, tuple[str, ...]] = {
    "VIEWER": (
        "rams:read",
    ),
    "TECHNICIAN": (
        "rams:read",
        "spk:write",
        "alarm:ack",
        "alarm:resolve",
    ),
    "ADMIN": (
        "rams:read",
        "spk:write",
        "alarm:ack",
        "alarm:resolve",
        "users:manage",
        "system:manage",
        "rules:manage",
        "pipeline:refresh",
        "dev:ingest",
    ),
}


def permissions_for_role(role: str) -> list[str]:
    return list(ROLE_PERMISSIONS.get(role, ()))


def build_authorization_contract(issuer: str, audience: str) -> dict[str, object]:
    return {
        "issuer": issuer,
        "audience": audience,
        "subject_claim": "sub",
        "subject_format": "user_id",
        "role_claim": "role",
        "permissions_claim": "permissions",
        "roles": {
            role: list(permissions)
            for role, permissions in ROLE_PERMISSIONS.items()
        },
    }
