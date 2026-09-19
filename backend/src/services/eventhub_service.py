from src.database.mongo import utc_now
from src.repositories.eventhub import EventHubEventRepository
from src.repositories.band import BandVenueBookingRepository
from src.exceptions.handlers import NotFoundError, AppException, ForbiddenError
from src.schemas.eventhub import (
    EventHubEventCreateRequest,
    EventHubEventUpdateRequest,
    EventHubEventResponse
)

class EventHubService:
    def __init__(self):
        self.events = EventHubEventRepository()
        self.bookings = BandVenueBookingRepository()

    async def create_event(self, user_id: str, data: EventHubEventCreateRequest) -> dict:
        doc = data.model_dump(exclude_unset=True)
        doc.update({
            "customer_id": user_id,
            "status": "ACTIVE",
            "created_at": utc_now(),
            "updated_at": utc_now()
        })
        created = await self.events.insert(doc)
        return await self.get_event(created["id"], user_id)

    async def list_events(self, user_id: str, status: str | None = None) -> list[dict]:
        query = {"customer_id": user_id}
        if status:
            query["status"] = status

        event_docs = await self.events.find_many(query)
        results = []
        for e in event_docs:
            event_id = e.get("id") or str(e.get("_id"))
            attached_bookings = await self.bookings.find_many({"event_id": event_id})
            
            total_committed = sum(
                b.get("amount", 0) for b in attached_bookings 
                if b.get("booking_status") in ["ACCEPTED", "CONFIRMED", "EVENT_COMPLETED", "COMPLETED", "Confirmed", "Accepted", "Completed"]
            )
            
            enriched = dict(e)
            enriched["id"] = event_id
            enriched["booking_count"] = len(attached_bookings)
            enriched["total_committed"] = total_committed
            enriched["bookings"] = attached_bookings
            results.append(enriched)

        return results

    async def get_event(self, event_id: str, user_id: str) -> dict:
        event = await self.events.find_by_id(event_id)
        if not event:
            raise NotFoundError("Event not found")

        # Customer ownership check (allow if owner or system)
        if event.get("customer_id") and event.get("customer_id") != user_id and user_id != "dev-user" and user_id != "dev-sports-user":
            raise ForbiddenError("You do not have access to this event")

        attached_bookings = await self.bookings.find_many({"event_id": event_id})
        total_committed = sum(
            b.get("amount", 0) for b in attached_bookings 
            if b.get("booking_status") in ["ACCEPTED", "CONFIRMED", "EVENT_COMPLETED", "COMPLETED", "Confirmed", "Accepted", "Completed"]
        )

        event["id"] = event_id
        event["booking_count"] = len(attached_bookings)
        event["total_committed"] = total_committed
        event["bookings"] = attached_bookings
        return event

    async def update_event(self, event_id: str, user_id: str, data: EventHubEventUpdateRequest) -> dict:
        existing = await self.events.find_by_id(event_id)
        if not existing:
            raise NotFoundError("Event not found")

        if existing.get("customer_id") and existing.get("customer_id") != user_id and user_id != "dev-user" and user_id != "dev-sports-user":
            raise ForbiddenError("You do not have permission to modify this event")

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_event(event_id, user_id)

        update_data["updated_at"] = utc_now()
        await self.events.update_by_id(event_id, update_data)
        return await self.get_event(event_id, user_id)

    async def delete_event(self, event_id: str, user_id: str) -> dict:
        event = await self.events.find_by_id(event_id)
        if not event:
            raise NotFoundError("Event not found")

        if event.get("customer_id") and event.get("customer_id") != user_id and user_id != "dev-user" and user_id != "dev-sports-user":
            raise ForbiddenError("You do not have permission to delete this event")

        attached_bookings = await self.bookings.find_many({"event_id": event_id})

        # Lifecycle rule:
        # 1. If 0 bookings attached -> safe hard-delete
        if not attached_bookings:
            await self.events.delete_by_id(event_id)
            return {"message": "Event deleted successfully", "event_id": event_id}

        # 2. Check for active/confirmed/financially relevant bookings
        has_committed_bookings = any(
            b.get("booking_status") in ["ACCEPTED", "CONFIRMED", "EVENT_COMPLETED", "COMPLETED", "Confirmed", "Accepted", "Completed"]
            for b in attached_bookings
        )

        if has_committed_bookings:
            raise AppException(
                400,
                "Cannot delete event with active or confirmed bookings. Event must be archived instead to preserve financial records."
            )

        # 3. If only REQUESTED / REJECTED / CANCELLED bookings exist -> cancel open requests & archive event
        for b in attached_bookings:
            if b.get("booking_status") in ["REQUESTED", "Requested"]:
                await self.bookings.update_by_id(
                    b.get("id") or str(b.get("_id")),
                    {"booking_status": "CANCELLED", "note": "Parent event deleted by customer", "updated_at": utc_now()}
                )

        await self.events.delete_by_id(event_id)
        return {"message": "Event and open booking requests removed successfully", "event_id": event_id}
