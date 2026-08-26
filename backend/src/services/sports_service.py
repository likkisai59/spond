from src.database.mongo import utc_now
from src.repositories.sports import (
    GroupRepository, GroupMemberRepository, EventRepository,
    RsvpRepository, AttendanceRepository,
    SportsVenueRepository, SportsSlotRepository, SportsBookingRepository
)
from src.exceptions.handlers import NotFoundError, AppException
from src.schemas.sports import (
    GroupCreateRequest, GroupUpdateRequest,
    AddMemberRequest, UpdateMemberRoleRequest,
    EventCreateRequest, EventUpdateRequest,
    RsvpRequest, MarkAttendanceRequest,
    VenueCreateRequest, VenueUpdateRequest,
    SlotCreateRequest, SlotUpdateRequest,
    BookingCreateRequest
)
from bson import ObjectId

class SportsService:
    def __init__(self):
        self.groups = GroupRepository()
        self.members = GroupMemberRepository()
        self.events = EventRepository()
        self.rsvps = RsvpRepository()
        self.attendance = AttendanceRepository()
        self.venues = SportsVenueRepository()
        self.slots = SportsSlotRepository()
        self.bookings = SportsBookingRepository()

    async def create_group(self, user_id: str, data: GroupCreateRequest) -> dict:
        existing = await self.groups.find_one({"name": data.name})
        if existing:
            raise AppException(400, "Group name already exists")
        
        group_doc = data.model_dump(exclude_unset=True)
        group_doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "member_count": 1
        })
        inserted_group = await self.groups.insert(group_doc)
        group_id = inserted_group["id"]
        
        # Add creator as Owner
        await self.members.insert({
            "group_id": group_id,
            "user_id": user_id,
            "role": "Owner",
            "status": "Active",
            "joined_at": utc_now()
        })
        return await self.get_group(group_id)

    async def list_groups(self) -> list[dict]:
        return await self.groups.find_many({})

    async def get_group(self, group_id: str) -> dict:
        group = await self.groups.find_by_id(group_id)
        if not group:
            raise NotFoundError("Group not found")
        members = await self.members.find_many({"group_id": group_id})
        group["members"] = members
        group["member_count"] = len(members)
        return group

    async def update_group(self, group_id: str, data: GroupUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_group(group_id)
            
        update_data["updated_at"] = utc_now()
        updated = await self.groups.update_by_id(group_id, update_data)
        if not updated:
            raise NotFoundError("Group not found")
        return await self.get_group(group_id)

    async def delete_group(self, group_id: str) -> None:
        deleted = await self.groups.delete_by_id(group_id)
        if not deleted:
            raise NotFoundError("Group not found")
        await self.members.collection.delete_many({"group_id": group_id})
        await self.events.collection.delete_many({"group_id": group_id})

    async def add_member(self, group_id: str, data: AddMemberRequest) -> dict:
        existing = await self.members.find_one({"group_id": group_id, "user_id": data.user_id})
        if existing:
            raise AppException(400, "User is already a member")
            
        await self.members.insert({
            "group_id": group_id,
            "user_id": data.user_id,
            "role": data.role,
            "status": "Active",
            "joined_at": utc_now()
        })
        return await self.get_group(group_id)

    async def remove_member(self, group_id: str, member_id: str) -> None:
        deleted = await self.members.collection.delete_one({"group_id": group_id, "user_id": member_id})
        if deleted.deleted_count == 0:
            raise NotFoundError("Member not found in group")

    async def update_member_role(self, group_id: str, member_id: str, data: UpdateMemberRoleRequest) -> None:
        updated = await self.members.collection.update_one(
            {"group_id": group_id, "user_id": member_id},
            {"$set": {"role": data.role}}
        )
        if updated.modified_count == 0:
            raise NotFoundError("Member not found in group")

    # Events
    async def create_event(self, user_id: str, data: EventCreateRequest) -> dict:
        event_doc = data.model_dump(exclude_unset=True)
        if data.name and not data.title:
            event_doc["title"] = data.name
        elif data.title and not data.name:
            event_doc["name"] = data.title

        if data.event_type and not data.type:
            event_doc["type"] = data.event_type
        elif data.type and not data.event_type:
            event_doc["event_type"] = data.type

        event_doc.update({
            "created_by": user_id,
            "status": "Upcoming"
        })
        inserted_event = await self.events.insert(event_doc)
        return await self.get_event(inserted_event["id"])

    async def get_event(self, event_id: str) -> dict:
        event = await self.events.find_by_id(event_id)
        if not event:
            raise NotFoundError("Event not found")
        # Calc attendance summary
        going = await self.attendance.collection.count_documents({"event_id": event_id, "attendance_status": "Going"})
        event["attendance"] = {"going": going, "maybe": 0, "not_responded": 0}
        return event
        
    async def list_events(self) -> list[dict]:
        return await self.events.find_many({})

    async def update_event(self, event_id: str, data: EventUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_event(event_id)
        
        updated = await self.events.update_by_id(event_id, update_data)
        if not updated:
            raise NotFoundError("Event not found")
        return await self.get_event(event_id)

    async def delete_event(self, event_id: str) -> None:
        deleted = await self.events.delete_by_id(event_id)
        if not deleted:
            raise NotFoundError("Event not found")

    async def rsvp_event(self, event_id: str, user_id: str, data: RsvpRequest) -> dict:
        await self.rsvps.collection.update_one(
            {"event_id": event_id, "user_id": user_id},
            {"$set": {"status": data.status, "updated_at": utc_now()}},
            upsert=True
        )
        return await self.rsvps.find_one({"event_id": event_id, "user_id": user_id})

    async def get_rsvps(self, event_id: str) -> list[dict]:
        return await self.rsvps.find_many({"event_id": event_id})

    async def mark_attendance(self, marked_by: str, data: MarkAttendanceRequest) -> dict:
        await self.attendance.collection.update_one(
            {"event_id": data.event_id, "user_id": data.user_id},
            {"$set": {
                "attendance_status": data.attendance_status,
                "marked_by": marked_by,
                "marked_at": utc_now()
            }},
            upsert=True
        )
        return await self.attendance.find_one({"event_id": data.event_id, "user_id": data.user_id})

    async def get_attendance(self, event_id: str) -> list[dict]:
        return await self.attendance.find_many({"event_id": event_id})

    # Venues
    async def create_venue(self, user_id: str, data: VenueCreateRequest) -> dict:
        venue_doc = data.model_dump(exclude_unset=True)
        venue_doc.update({
            "created_by": user_id,
            "status": "Draft",
            "created_at": utc_now()
        })
        inserted_venue = await self.venues.insert(venue_doc)
        return await self.get_venue(inserted_venue["id"])

    async def get_venue(self, venue_id: str) -> dict:
        venue = await self.venues.find_by_id(venue_id)
        if not venue:
            raise NotFoundError("Venue not found")
        return venue

    async def list_venues(self, query: dict = None) -> list[dict]:
        q = query or {}
        if "status" not in q:
            q["status"] = "Published"
        return await self.venues.find_many(q)

    async def list_owner_venues(self, user_id: str) -> list[dict]:
        return await self.venues.find_many({"created_by": user_id})

    async def update_venue(self, venue_id: str, data: VenueUpdateRequest, user_id: str) -> dict:
        venue = await self.get_venue(venue_id)
        if venue.get("created_by") != user_id:
            raise AppException(403, "Not authorized to update this venue")
            
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            updated = await self.venues.update_by_id(venue_id, update_data)
            if not updated:
                raise NotFoundError("Venue not found")
        return await self.get_venue(venue_id)

    async def delete_venue(self, venue_id: str, user_id: str) -> None:
        venue = await self.get_venue(venue_id)
        if venue.get("created_by") != user_id:
            raise AppException(403, "Not authorized to delete this venue")
            
        deleted = await self.venues.delete_by_id(venue_id)
        if not deleted:
            raise NotFoundError("Venue not found")
        await self.slots.collection.delete_many({"venue_id": venue_id})

    # Slots
    async def create_slot(self, venue_id: str, data: SlotCreateRequest, user_id: str) -> dict:
        venue = await self.get_venue(venue_id)
        if venue.get("created_by") != user_id:
            raise AppException(403, "Not authorized to create slots for this venue")
        
        slot_doc = data.model_dump(exclude_unset=True)
        slot_doc["venue_id"] = venue_id
        inserted_slot = await self.slots.insert(slot_doc)
        return await self.get_slot(inserted_slot["id"])

    async def get_slot(self, slot_id: str) -> dict:
        slot = await self.slots.find_by_id(slot_id)
        if not slot:
            raise NotFoundError("Slot not found")
        return slot

    async def list_slots(self, venue_id: str, date: str = None) -> list[dict]:
        query = {"venue_id": venue_id}
        if date:
            query["date"] = date
        return await self.slots.find_many(query)

    async def update_slot(self, slot_id: str, data: SlotUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            updated = await self.slots.update_by_id(slot_id, update_data)
            if not updated:
                raise NotFoundError("Slot not found")
        return await self.get_slot(slot_id)

    async def delete_slot(self, slot_id: str) -> None:
        deleted = await self.slots.delete_by_id(slot_id)
        if not deleted:
            raise NotFoundError("Slot not found")

    async def generate_slots(self, venue_id: str, data: dict, user_id: str) -> list[dict]:
        from datetime import datetime, timedelta
        
        venue = await self.get_venue(venue_id)
        if venue.get("created_by") != user_id:
            raise AppException(403, "Not authorized to create slots for this venue")

        start_date = datetime.strptime(data["start_date"], "%Y-%m-%d")
        end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
        
        if end_date < start_date:
            raise AppException(400, "End date cannot be before start date")
            
        duration = data.get("slot_duration_minutes", 60)
        price = data["price"]
        
        # parse times
        st_hour, st_minute = map(int, data["start_time"].split(":"))
        en_hour, en_minute = map(int, data["end_time"].split(":"))
        
        created_slots = []
        
        curr_date = start_date
        while curr_date <= end_date:
            date_str = curr_date.strftime("%Y-%m-%d")
            
            # Start time on this day
            curr_time = datetime(curr_date.year, curr_date.month, curr_date.day, st_hour, st_minute)
            end_time = datetime(curr_date.year, curr_date.month, curr_date.day, en_hour, en_minute)
            
            # If end time is technically on the next day (e.g. 02:00 vs 23:00)
            if end_time <= curr_time:
                end_time += timedelta(days=1)
                
            while curr_time + timedelta(minutes=duration) <= end_time:
                slot_start = curr_time.strftime("%H:%M")
                slot_end = (curr_time + timedelta(minutes=duration)).strftime("%H:%M")
                
                # Check if this exact slot already exists
                existing = await self.slots.find_one({
                    "venue_id": venue_id,
                    "date": date_str,
                    "start_time": slot_start,
                    "end_time": slot_end
                })
                
                if not existing:
                    slot_doc = {
                        "venue_id": venue_id,
                        "date": date_str,
                        "start_time": slot_start,
                        "end_time": slot_end,
                        "price": price,
                        "is_available": True
                    }
                    inserted_slot = await self.slots.insert(slot_doc)
                    created_slots.append(await self.get_slot(inserted_slot["id"]))
                    
                curr_time += timedelta(minutes=duration)
                
            curr_date += timedelta(days=1)
            
        return created_slots

    # Bookings
    async def create_booking(self, user_id: str, data: BookingCreateRequest) -> dict:
        from src.database.mongo import get_client
        from src.database.redis import RedisClient
        import asyncio

        slot = await self.get_slot(data.slot_id)
        if not slot.get("is_available"):
            raise AppException(400, "Slot is not available")

        # Redis Lock for 5 mins
        redis_client = RedisClient.get_client()
        lock_key = f"lock:slot:{data.slot_id}"
        acquired = await redis_client.set(lock_key, user_id, nx=True, ex=300)
        if not acquired:
            raise AppException(400, "Slot is currently being booked by someone else")
            
        if data.amount != slot.get("price"):
            # Ensure they don't spoof the price
            raise AppException(400, "Booking amount does not match slot price")

        try:
            booking_doc = data.model_dump(exclude_unset=True)
            booking_doc.update({
                "booked_by": user_id,
                "booking_status": "HELD",
                "created_at": utc_now()
            })

            mongo_client = get_client()
            
            # Since Motor doesn't support transactions on standalone easily without a replica set,
            # we will try to use transactions. If it fails, fallback to simple operations.
            booking_id = None
            try:
                async with await mongo_client.start_session() as session:
                    async with session.start_transaction():
                        result = await self.bookings.collection.insert_one(booking_doc, session=session)
                        booking_id = str(result.inserted_id)
                        await self.slots.collection.update_one(
                            {"_id": ObjectId(data.slot_id)},
                            {"$set": {"is_available": False}},
                            session=session
                        )
            except Exception as e:
                # Fallback to non-transactional if replSet is not fully ready
                inserted_booking = await self.bookings.insert(booking_doc)
                booking_id = inserted_booking["id"]
                await self.slots.collection.update_one(
                    {"_id": ObjectId(data.slot_id)},
                    {"$set": {"is_available": False}}
                )

            # Confirm payment pending flow (in real app, we'd wait for payment hook)
            # Here we just mark it CONFIRMED for simplicity
            await self.bookings.update_by_id(booking_id, {"booking_status": "CONFIRMED"})
            return await self.get_booking(booking_id)
        finally:
            # Release lock after we have successfully persisted to DB (or failed)
            await redis_client.delete(lock_key)

    async def get_booking(self, booking_id: str) -> dict:
        booking = await self.bookings.find_by_id(booking_id)
        if not booking:
            raise NotFoundError("Booking not found")
        return booking

    async def list_bookings(self, query: dict = None) -> list[dict]:
        return await self.bookings.find_many(query or {})

    async def list_owner_bookings(self, user_id: str) -> list[dict]:
        # Find all venues owned by this user
        owner_venues = await self.venues.find_many({"created_by": user_id})
        venue_ids = [str(v["_id"]) for v in owner_venues]
        
        if not venue_ids:
            return []
            
        # Find bookings for these venues
        return await self.bookings.find_many({"venue_id": {"$in": venue_ids}})

    async def cancel_booking(self, booking_id: str) -> dict:
        booking = await self.get_booking(booking_id)
        if booking.get("booking_status") in ["CANCELLED", "COMPLETED"]:
            raise AppException(400, "Booking cannot be cancelled")

        updated = await self.bookings.update_by_id(booking_id, {"booking_status": "CANCELLED"})
        if not updated:
            raise NotFoundError("Booking not found")

        # Mark slot available again
        await self.slots.collection.update_one(
            {"_id": ObjectId(booking["slot_id"])},
            {"$set": {"is_available": True}}
        )

        return await self.get_booking(booking_id)
