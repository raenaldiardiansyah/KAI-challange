from ipaddress import ip_address

from fastapi import Request


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
    candidate = forwarded_for or (request.client.host if request.client else "unknown")
    try:
        return str(ip_address(candidate))
    except ValueError:
        return "unknown"


def get_user_agent(request: Request) -> str | None:
    value = request.headers.get("user-agent", "").strip()
    return value[:255] or None


def get_device_name(request: Request) -> str:
    explicit_name = request.headers.get("x-device-name", "").strip()
    if explicit_name:
        return explicit_name[:100]
    user_agent = get_user_agent(request)
    return (user_agent or "Perangkat tidak dikenal")[:100]
