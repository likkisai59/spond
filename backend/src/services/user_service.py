"""User management (admin) service."""
import math

from src.constants.roles import (
    PERM_USERS_READ,
    PERM_USERS_WRITE,
    ALL_ROLES,
    has_permission,
)
from src.exceptions.handlers import ForbiddenError, NotFoundError
from src.models.user import public_user
from src.repositories import UserRepository
from src.services.audit_service import AuditService


class UserService:
    def __init__(self) -> None:
        self.repo = UserRepository()
        self.audit = AuditService()

    def _assert_can_read(self, actor: dict) -> None:
        if not has_permission(actor["role"], PERM_USERS_READ):
            raise ForbiddenError("You do not have permission to view users")

    def _assert_can_write(self, actor: dict) -> None:
        if not has_permission(actor["role"], PERM_USERS_WRITE):
            raise ForbiddenError("You do not have permission to manage users")

    async def list_users(
        self,
        *,
        actor: dict,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        role: str | None = None,
        module: str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        self._assert_can_read(actor)
        query: dict = {"is_deleted": {"$ne": True}}
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search.strip(), "$options": "i"}},
                {"email": {"$regex": search.strip(), "$options": "i"}},
            ]
        if role:
            query["role"] = role
        if module:
            query["accessible_modules"] = module
        if is_active is not None:
            query["is_active"] = is_active

        limit = max(1, min(limit, 100))
        total = await self.repo.count(query)
        items = await self.repo.find_many(
            query,
            sort=[("created_at", -1)],
            skip=(page - 1) * limit,
            limit=limit,
        )
        return {
            "items": [public_user(item) for item in items],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": max(1, math.ceil(total / limit)),
            },
        }

    async def get_user(self, *, actor: dict, user_id: str) -> dict:
        if actor["id"] != user_id:
            self._assert_can_read(actor)
        user = await self.repo.find_by_id(user_id)
        if user is None or user.get("is_deleted"):
            raise NotFoundError("User not found")
        return public_user(user)

    async def update_user(
        self, *, actor: dict, user_id: str, changes: dict
    ) -> dict:
        self._assert_can_write(actor)
        target = await self.repo.find_by_id(user_id)
        if target is None or target.get("is_deleted"):
            raise NotFoundError("User not found")

        update: dict = {}
        if "full_name" in changes and changes["full_name"] is not None:
            update["full_name"] = changes["full_name"].strip()
        if "phone" in changes:
            update["phone"] = changes["phone"]
        if "profile_image" in changes:
            update["profile_image"] = changes["profile_image"]
        if changes.get("role") is not None:
            if changes["role"] not in ALL_ROLES:
                raise NotFoundError(f"Unknown role '{changes['role']}'")
            update["role"] = changes["role"]
        if changes.get("accessible_modules") is not None:
            update["accessible_modules"] = changes["accessible_modules"]
        if not update:
            return public_user(target)
        update["updated_by"] = actor["id"]

        updated = await self.repo.update_by_id(user_id, update)
        await self.audit.log(
            user_id=actor["id"],
            action="user_updated",
            module="users",
            detail=f"updated user {user_id}: {', '.join(update.keys())}",
        )
        return public_user(updated)

    async def set_status(self, *, actor: dict, user_id: str, is_active: bool) -> dict:
        self._assert_can_write(actor)
        target = await self.repo.find_by_id(user_id)
        if target is None or target.get("is_deleted"):
            raise NotFoundError("User not found")
        if target["id"] == actor["id"] and not is_active:
            raise ForbiddenError("You cannot deactivate your own account")
        updated = await self.repo.update_by_id(
            user_id, {"is_active": is_active, "updated_by": actor["id"]}
        )
        await self.audit.log(
            user_id=actor["id"],
            action="user_status_changed",
            module="users",
            detail=f"user {user_id} is_active={is_active}",
        )
        return public_user(updated)

    async def delete_user(self, *, actor: dict, user_id: str) -> None:
        self._assert_can_write(actor)
        target = await self.repo.find_by_id(user_id)
        if target is None or target.get("is_deleted"):
            raise NotFoundError("User not found")
        if target["id"] == actor["id"]:
            raise ForbiddenError("You cannot delete your own account")
        await self.repo.update_by_id(
            user_id, {"is_deleted": True, "is_active": False, "updated_by": actor["id"]}
        )
        await self.audit.log(
            user_id=actor["id"], action="user_deleted", module="users", detail=user_id
        )
