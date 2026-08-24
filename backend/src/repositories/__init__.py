"""Repositories (data access only, no business rules)."""
from src.constants.collections import AUDIT_LOGS, REFRESH_TOKENS, ROLES, USERS
from src.database.base_repository import BaseRepository
from src.database.mongo import utc_now

from src.repositories.sports import (
    GroupRepository,
    GroupMemberRepository,
    EventRepository,
    RsvpRepository,
    AttendanceRepository,
    SportsVenueRepository,
    SportsSlotRepository,
    SportsBookingRepository,
)

from src.repositories.band import (
    ArtistRepository,
    BandRepository,
    VenueRepository,
    BookingRepository,
    BandVenueBookingRepository,
)

from src.repositories.system import (
    PaymentRepository,
    TransactionRepository,
    PaymentReceiptRepository,
    FileRepository,
    FolderRepository,
    NotificationRepository,
    NotificationLogRepository
)

from src.repositories.matches import (
    MatchRepository,
    MatchSummaryRepository
)

from src.repositories.analytics import (
    PlayerStatsRepository,
    BandArtistAnalyticsRepository,
    BandVenueAnalyticsRepository,
    DashboardAnalyticsRepository
)


class UserRepository(BaseRepository):
    collection_name = USERS

    async def ensure_indexes(self) -> None:
        await self.create_index([("email", 1)], unique=True)
        await self.create_index([("role", 1), ("is_deleted", 1)])

    async def find_active_by_email(self, email: str) -> dict | None:
        return await self.find_one(
            {"email": email.strip().lower(), "is_deleted": {"$ne": True}}
        )

    async def email_exists(self, email: str) -> bool:
        return await self.find_one(
            {"email": email.strip().lower(), "is_deleted": {"$ne": True}}
        ) is not None


class RoleRepository(BaseRepository):
    collection_name = ROLES

    async def ensure_indexes(self) -> None:
        await self.create_index([("role_name", 1)], unique=True)

    async def upsert_many(self, definitions: list[dict]) -> None:
        from src.database.mongo import utc_now

        for definition in definitions:
            await self.collection.update_one(
                {"role_name": definition["role_name"]},
                {
                    "$set": {
                        **definition,
                        "updated_at": utc_now(),
                    },
                    "$setOnInsert": {"created_at": utc_now()},
                },
                upsert=True,
            )


class TokenRepository(BaseRepository):
    """Refresh + reset token registry (rotation & revocation)."""

    collection_name = REFRESH_TOKENS

    async def ensure_indexes(self) -> None:
        await self.create_index([("jti", 1)], unique=True)
        await self.create_index([("user_id", 1), ("revoked", 1)])

    async def store(
        self,
        *,
        jti: str,
        user_id: str,
        token_type: str,
        expires_at,
    ) -> None:
        await self.insert(
            {"jti": jti, "user_id": user_id, "token_type": token_type,
             "expires_at": expires_at, "revoked": False}
        )

    async def is_active(self, jti: str) -> bool:
        doc = await self.find_one({"jti": jti, "revoked": False})
        return doc is not None

    async def revoke(self, jti: str) -> None:
        await self.collection.update_one(
            {"jti": jti, "revoked": False},
            {"$set": {"revoked": True, "updated_at": utc_now()}},
        )

    async def revoke_all_for_user(self, user_id: str) -> None:
        await self.collection.update_many(
            {"user_id": user_id, "revoked": False},
            {"$set": {"revoked": True, "updated_at": utc_now()}},
        )


class AuditRepository(BaseRepository):
    collection_name = AUDIT_LOGS

    async def ensure_indexes(self) -> None:
        await self.create_index([("user_id", 1), ("created_at", -1)])
        await self.create_index([("action", 1)])
