"""Auth dependencies: current user, RBAC guards, module access."""
from fastapi import Depends, Request

from src.constants.roles import (
    ADMIN_ROLES,
    PERM_ROLES_READ,
    has_permission,
)
from src.core import security
from src.exceptions.handlers import ForbiddenError, UnauthorizedError
from src.models.user import public_user
from src.repositories import UserRepository


async def get_current_user(request: Request) -> dict:
    """Validates Bearer access token; user doc attached to request.state."""
    cached = getattr(request.state, "user_details", None)
    if cached is not None:
        return cached

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise UnauthorizedError("Missing bearer token")
    token = auth_header.removeprefix("Bearer ").strip()
    try:
        payload = security.decode_token(token, security.TOKEN_TYPE_ACCESS)
    except Exception as exc:
        raise UnauthorizedError("Invalid or expired access token") from exc

    user = await UserRepository().find_by_id(payload["sub"])
    if user is None or user.get("is_deleted"):
        raise UnauthorizedError("Account not found")
    if not user.get("is_active", True):
        raise ForbiddenError("Account is deactivated")

    user_details = {**public_user(user), "id": user["id"]}
    request.state.user_details = user_details
    return user_details


def require_roles(*roles: str):
    async def _dependency(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise ForbiddenError("You do not have permission to perform this action")
        return user

    return _dependency


def require_permissions(*permissions: str):
    async def _dependency(user: dict = Depends(get_current_user)) -> dict:
        for permission in permissions:
            if not has_permission(user["role"], permission):
                raise ForbiddenError(
                    f"Missing required permission '{permission}'"
                )
        return user

    return _dependency


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] not in ADMIN_ROLES:
        raise ForbiddenError("Administrator access required")
    return user


async def require_roles_read(user: dict = Depends(get_current_user)) -> dict:
    if not has_permission(user["role"], PERM_ROLES_READ) and user["role"] not in ADMIN_ROLES:
        raise ForbiddenError("You do not have permission to view roles")
    return user
