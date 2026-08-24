from src.constants.collections import (
    SPORTS_GROUPS,
    SPORTS_GROUP_MEMBERS,
    SPORTS_EVENTS,
    SPORTS_RSVPS,
    SPORTS_ATTENDANCE,
    SPORTS_VENUES,
    SPORTS_VENUE_SLOTS,
    SPORTS_BOOKINGS
)
from src.database.base_repository import BaseRepository

class GroupRepository(BaseRepository):
    collection_name = SPORTS_GROUPS

    async def ensure_indexes(self) -> None:
        await self.create_index([("name", 1)], unique=True)
        await self.create_index([("category", 1)])

class GroupMemberRepository(BaseRepository):
    collection_name = SPORTS_GROUP_MEMBERS

    async def ensure_indexes(self) -> None:
        await self.create_index([("group_id", 1), ("user_id", 1)], unique=True)

class EventRepository(BaseRepository):
    collection_name = SPORTS_EVENTS

    async def ensure_indexes(self) -> None:
        await self.create_index([("group_id", 1)])
        await self.create_index([("start_time", 1)])

class RsvpRepository(BaseRepository):
    collection_name = SPORTS_RSVPS

    async def ensure_indexes(self) -> None:
        await self.create_index([("event_id", 1), ("user_id", 1)], unique=True)

class AttendanceRepository(BaseRepository):
    collection_name = SPORTS_ATTENDANCE

    async def ensure_indexes(self) -> None:
        await self.create_index([("event_id", 1), ("user_id", 1)], unique=True)

class SportsVenueRepository(BaseRepository):
    collection_name = SPORTS_VENUES

    async def ensure_indexes(self) -> None:
        await self.create_index([("city", 1)])
        await self.create_index([("sport_type", 1)])

class SportsSlotRepository(BaseRepository):
    collection_name = SPORTS_VENUE_SLOTS

    async def ensure_indexes(self) -> None:
        await self.create_index([("venue_id", 1), ("date", 1), ("start_time", 1)])

class SportsBookingRepository(BaseRepository):
    collection_name = SPORTS_BOOKINGS

    async def ensure_indexes(self) -> None:
        await self.create_index([("venue_id", 1)])
        await self.create_index([("slot_id", 1)])
        await self.create_index([("booked_by", 1)])
