"""Role catalog endpoints (/api/v1/roles/*) — authenticated read."""
from fastapi import APIRouter, Depends

from src.dependencies.auth import require_roles_read
from src.schemas import RoleListResponse, RoleResponse
from src.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", summary="List all platform roles with permissions")
async def list_roles(_: dict = Depends(require_roles_read)) -> dict:
    roles = await RoleService().list_roles()
    return {"status": "success", "data": RoleListResponse(items=roles).model_dump(mode="json")["items"]}


@router.get("/{role_id}", summary="Get a role by id")
async def get_role(
    role_id: str, _: dict = Depends(require_roles_read)
) -> dict:
    role = await RoleService().get_role(role_id=role_id)
    return {"status": "success", "data": RoleResponse(**role).model_dump(mode="json")}
