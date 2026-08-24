"""Business services (all state changes flow through here)."""
from datetime import datetime, timezone

from src.constants.collections import AUDIT_LOGS


class AuditService:
    def __init__(self) -> None:
        from src.repositories import AuditRepository

        self.repo = AuditRepository()

    async def log(
        self,
        *,
        user_id: str | None,
        action: str,
        module: str = "platform",
        detail: str | None = None,
    ) -> None:
        try:
            await self.repo.insert(
                {
                    "user_id": user_id,
                    "action": action,
                    "module": module,
                    "detail": detail,
                    "created_at": datetime.now(timezone.utc),
                }
            )
        except Exception:  # audit must never break the request
            from src.utils.logger import get_logger

            get_logger("unify.audit").exception("audit write failed action=%s", action)


__all__ = ["AuditService", "AUDIT_LOGS"]
