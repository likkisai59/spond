"""Role catalog service (roles are seeded from constants, read-only in Phase 1)."""
from src.exceptions.handlers import NotFoundError
from src.repositories import RoleRepository
from src.constants.roles import role_definitions


class RoleService:
    def __init__(self) -> None:
        self.repo = RoleRepository()

    async def list_roles(self) -> list[dict]:
        docs = await self.repo.find_many({}, sort=[("role_name", 1)])
        return [
            {
                "id": doc["id"],
                "role_name": doc["role_name"],
                "description": doc.get("description"),
                "permissions": doc.get("permissions", []),
                "allowed_modules": doc.get("allowed_modules", []),
            }
            for doc in docs
        ]

    async def get_role(self, *, role_id: str) -> dict:
        doc = await self.repo.find_by_id(role_id)
        if doc is None:
            raise NotFoundError("Role not found")
        return {
            "id": doc["id"],
            "role_name": doc["role_name"],
            "description": doc.get("description"),
            "permissions": doc.get("permissions", []),
            "allowed_modules": doc.get("allowed_modules", []),
        }

    async def seed_roles(self) -> None:
        await self.repo.upsert_many(role_definitions())
