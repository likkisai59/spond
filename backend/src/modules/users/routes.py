"""User management endpoints (/api/v1/users/*) — admin scoped."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from src.dependencies.auth import get_current_user, require_permissions
from src.constants.roles import PERM_USERS_READ, PERM_USERS_WRITE
from src.schemas import (
    MessageResponse,
    UserListResponse,
    UserResponse,
    UserStatusRequest,
    UserUpdateRequest,
)
from src.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def _ok(data) -> dict:
    return {"status": "success", "data": data}


@router.get("", summary="List users (admin; searchable + paginated)")
async def list_users(
    actor: Annotated[dict, Depends(require_permissions(PERM_USERS_READ))],
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    role: str | None = None,
    module: str | None = Query(None, pattern="^(sports|band)$"),
    is_active: bool | None = None,
) -> dict:
    result = await UserService().list_users(
        actor=actor,
        page=page,
        limit=limit,
        search=search,
        role=role,
        module=module,
        is_active=is_active,
    )
    return _ok(UserListResponse(**result).model_dump(mode="json"))


@router.get("/{user_id}", summary="Get user by id (self or admin)")
async def get_user(
    user_id: str,
    actor: Annotated[dict, Depends(get_current_user)],
) -> dict:
    user = await UserService().get_user(actor=actor, user_id=user_id)
    return _ok(UserResponse(**user).model_dump(mode="json"))


@router.put("/{user_id}", summary="Update user (admin)")
async def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    actor: Annotated[dict, Depends(require_permissions(PERM_USERS_WRITE))],
) -> dict:
    user = await UserService().update_user(
        actor=actor,
        user_id=user_id,
        changes=payload.model_dump(exclude_unset=True),
    )
    return _ok(UserResponse(**user).model_dump(mode="json"))


@router.patch("/{user_id}/status", summary="Activate / deactivate a user (admin)")
async def set_status(
    user_id: str,
    payload: UserStatusRequest,
    actor: Annotated[dict, Depends(require_permissions(PERM_USERS_WRITE))],
) -> dict:
    user = await UserService().set_status(
        actor=actor, user_id=user_id, is_active=payload.is_active
    )
    return _ok(UserResponse(**user).model_dump(mode="json"))


@router.delete("/{user_id}", summary="Soft-delete a user (admin)")
async def delete_user(
    user_id: str,
    actor: Annotated[dict, Depends(require_permissions(PERM_USERS_WRITE))],
) -> dict:
    await UserService().delete_user(actor=actor, user_id=user_id)
    return _ok(MessageResponse(message="User deleted").model_dump())
