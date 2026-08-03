from app.core.permissions import permissions_for_role


def test_viewer_can_only_read_rams_data() -> None:
    assert permissions_for_role("VIEWER") == ["rams:read"]


def test_technician_gets_operational_permissions() -> None:
    permissions = permissions_for_role("TECHNICIAN")

    assert "rams:read" in permissions
    assert "spk:write" in permissions
    assert "alarm:ack" in permissions
    assert "users:manage" not in permissions


def test_admin_gets_user_and_system_management_permissions() -> None:
    permissions = permissions_for_role("ADMIN")

    assert "users:manage" in permissions
    assert "system:manage" in permissions
    assert "dev:ingest" in permissions
