import json
import uuid
import asyncio
import logging
from src.database.redis import RedisClient
from src.database.mongo import utc_now
from src.repositories.sports import (
    GroupRepository, GroupMemberRepository, EventRepository,
    RsvpRepository, AttendanceRepository,
    SportsVenueRepository, SportsSlotRepository, SportsBookingRepository,
    PaymentRequestRepository, PollRepository
)
from src.repositories import UserRepository
from src.exceptions.handlers import NotFoundError, AppException
from src.services.email_service import EmailService
from src.schemas.sports import (
    GroupCreateRequest, GroupUpdateRequest,
    AddMemberRequest, UpdateMemberRoleRequest,
    EventCreateRequest, EventUpdateRequest,
    RsvpRequest, MarkAttendanceRequest,
    VenueCreateRequest, VenueUpdateRequest,
    SlotCreateRequest, SlotUpdateRequest,
    BookingCreateRequest,
    PaymentRequestCreateRequest,
    PollCreateRequest, PollVoteRequest
)
from bson import ObjectId

logger = logging.getLogger("spond.sports")

class SportsService:
    def __init__(self):
        self.users = UserRepository()
        self.groups = GroupRepository()
        self.members = GroupMemberRepository()
        self.events = EventRepository()
        self.rsvps = RsvpRepository()
        self.attendance = AttendanceRepository()
        self.venues = SportsVenueRepository()
        self.slots = SportsSlotRepository()
        self.bookings = SportsBookingRepository()
        self.payment_requests = PaymentRequestRepository()
        self.polls = PollRepository()
        self.email_service = EmailService()

    async def create_group(self, user_id: str, data: GroupCreateRequest) -> dict:
        existing = await self.groups.find_one({"name": data.name})
        if existing:
            raise AppException(400, "Group name already exists")
        
        group_doc = data.model_dump(exclude_unset=True, by_alias=False)
        group_doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "member_count": 1
        })
        created = await self.groups.insert(group_doc)
        group_id = created["id"]
        
        # Fetch user details for the owner
        creator = None
        try:
            creator = await self.users.find_by_id(user_id)
        except Exception:
            pass
            
        creator_name = creator.get("full_name", "Unknown User") if creator else "Unknown User"
        creator_email = creator.get("email", "") if creator else ""

        # Add creator as Owner
        await self.members.insert({
            "group_id": group_id,
            "user_id": user_id,
            "name": creator_name,
            "email": creator_email,
            "role": "Owner",
            "status": "Active",
            "joined_at": utc_now()
        })

        # Invalidate dashboard cache
        try:
            redis = RedisClient.get_client()
            await redis.delete(
                "analytics:sports:dashboard:overview",
                f"analytics:sports:dashboard:overview:{user_id}"
            )
        except Exception:
            pass

        return await self.get_group(group_id)

    async def list_groups(self, user_id: str = None) -> list[dict]:
        query = {}
        if user_id:
            member_records = await self.members.find_many({"user_id": user_id})
            group_ids = []
            for m in member_records:
                gid = m.get("group_id")
                if gid:
                    if ObjectId.is_valid(str(gid)):
                        group_ids.append(ObjectId(str(gid)))
                    group_ids.append(gid)
            query = {
                "$or": [
                    {"created_by": user_id},
                    {"_id": {"$in": group_ids}}
                ]
            }
        groups = await self.groups.find_many(query)
        for group in groups:
            members = await self.members.find_many({"group_id": group["id"]})
            for m in members:
                try:
                    if "user_id" in m:
                        user = await self.users.find_by_id(m["user_id"])
                        if user:
                            m["name"] = user.get("full_name", m.get("name", "Unknown User"))
                            m["email"] = user.get("email", m.get("email", ""))
                            continue
                except Exception:
                    pass
                m.setdefault("name", "Unknown User")
                m.setdefault("email", "")
            group["members"] = members
            group["member_count"] = len(members)
        return groups

    async def get_group(self, group_id: str) -> dict:
        group = await self.groups.find_by_id(group_id)
        if not group:
            raise NotFoundError("Group not found")
        members = await self.members.find_many({"group_id": group_id})
        for m in members:
            try:
                if "user_id" in m:
                    user = await self.users.find_by_id(m["user_id"])
                    if user:
                        m["name"] = user.get("full_name", m.get("name", "Unknown User"))
                        m["email"] = user.get("email", m.get("email", ""))
                        continue
            except Exception:
                pass
            m.setdefault("name", "Unknown User")
            m.setdefault("email", "")
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

    async def add_member(self, group_id: str, data: AddMemberRequest, current_user: dict = None) -> dict:
        actual_user_id = data.user_id
        
        if data.email:
            user = await self.users.find_one({"email": data.email})
            if user:
                actual_user_id = user["id"]
        elif actual_user_id and "@" in actual_user_id:
            user = await self.users.find_one({"email": actual_user_id})
            if user:
                actual_user_id = user["id"]
            else:
                data.email = actual_user_id
                actual_user_id = None
                
        if actual_user_id:
            existing = await self.members.find_one({"group_id": group_id, "user_id": actual_user_id})
        elif data.email:
            existing = await self.members.find_one({"group_id": group_id, "email": data.email})
        else:
            raise AppException(400, "Email or User ID is required")
            
        if existing:
            raise AppException(400, "User is already a member")

        invite_token = uuid.uuid4().hex
            
        await self.members.insert({
            "group_id": group_id,
            "user_id": actual_user_id if actual_user_id else f"guest_{data.email}",
            "name": data.name,
            "email": data.email,
            "role": data.role,
            "status": "Pending",
            "invite_token": invite_token,
            "joined_at": utc_now()
        })

        # Invalidate dashboard cache
        try:
            redis = RedisClient.get_client()
            keys_to_del = ["analytics:sports:dashboard:overview"]
            if current_user and "id" in current_user:
                keys_to_del.append(f"analytics:sports:dashboard:overview:{current_user['id']}")
            await redis.delete(*keys_to_del)
        except Exception:
            pass

        group = await self.get_group(group_id)

        admin_name = "Club Owner"
        if current_user:
            admin_name = current_user.get("full_name") or current_user.get("name") or "Club Owner"
        group_name = group.get("name", "Sports Group")

        if data.email:
            try:
                asyncio.create_task(
                    self.email_service.send_group_invite_email(
                        to_email=data.email,
                        member_name=data.name or "Member",
                        admin_name=admin_name,
                        group_name=group_name,
                        invite_token=invite_token
                    )
                )
            except Exception as e:
                logger.error(f"Failed to dispatch invitation email: {e}")

        return group

    async def respond_to_invitation(self, token: str, action: str) -> dict:
        if not token:
            raise AppException(400, "Invitation token is required")

        member = await self.members.find_one({"invite_token": token})
        if not member:
            raise NotFoundError("Invalid or expired invitation link")

        group = await self.groups.find_by_id(member["group_id"])
        group_name = group.get("name", "Sports Group") if group else "Sports Group"

        if action == "accept":
            await self.members.collection.update_one(
                {"invite_token": token},
                {"$set": {
                    "status": "Confirmed",
                    "joined_at": utc_now()
                }}
            )
            return {
                "status": "success",
                "action": "accepted",
                "group_name": group_name,
                "group_id": member["group_id"],
                "member_name": member.get("name", "Member")
            }
        elif action == "reject":
            await self.members.collection.update_one(
                {"invite_token": token},
                {"$set": {
                    "status": "Rejected"
                }}
            )
            return {
                "status": "success",
                "action": "rejected",
                "group_name": group_name,
                "group_id": member["group_id"],
                "member_name": member.get("name", "Member")
            }
        else:
            raise AppException(400, "Invalid action. Must be 'accept' or 'reject'")

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
        name_val = data.name or data.title or "Event"
        event_doc["name"] = name_val
        event_doc["title"] = name_val

        type_val = data.type or data.event_type or "Training"
        event_doc["type"] = type_val
        event_doc["event_type"] = type_val

        event_doc.update({
            "created_by": user_id,
            "status": "Upcoming",
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
        created = await self.events.insert(event_doc)

        # Invalidate dashboard cache
        try:
            redis = RedisClient.get_client()
            await redis.delete(
                "analytics:sports:dashboard:overview",
                f"analytics:sports:dashboard:overview:{user_id}"
            )
        except Exception:
            pass

        return await self.get_event(created["id"])

    async def get_event(self, event_id: str) -> dict:
        event = await self.events.find_by_id(event_id)
        if not event:
            raise NotFoundError("Event not found")
        # Calc attendance summary
        going = await self.attendance.collection.count_documents({"event_id": event_id, "attendance_status": "Going"})
        maybe = await self.rsvps.collection.count_documents({"event_id": event_id, "status": "Maybe"})
        event.setdefault("name", event.get("title", "Event"))
        event.setdefault("title", event.get("name", "Event"))
        event.setdefault("type", event.get("event_type", "Training"))
        event.setdefault("status", "Upcoming")
        event["attendance"] = {"going": going, "maybe": maybe, "not_responded": 0}
        return event
        
    async def list_events(self, group_id: str = None, user_id: str = None) -> list[dict]:
        query = {}
        if group_id:
            query["group_id"] = group_id
        elif user_id:
            user_groups = await self.list_groups(user_id)
            user_group_ids = [str(g["id"]) for g in user_groups if "id" in g]
            query = {
                "$or": [
                    {"created_by": user_id},
                    {"group_id": {"$in": user_group_ids}}
                ]
            }
        events = await self.events.find_many(query, sort=[("date", 1), ("created_at", -1)])
        for event in events:
            going = await self.attendance.collection.count_documents({"event_id": event["id"], "attendance_status": "Going"})
            maybe = await self.rsvps.collection.count_documents({"event_id": event["id"], "status": "Maybe"})
            event.setdefault("name", event.get("title", "Event"))
            event.setdefault("title", event.get("name", "Event"))
            event.setdefault("type", event.get("event_type", "Training"))
            event.setdefault("status", "Upcoming")
            event["attendance"] = {"going": going, "maybe": maybe, "not_responded": 0}
        return events

    async def update_event(self, event_id: str, data: EventUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_event(event_id)
        
        update_data["updated_at"] = utc_now()
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
            "created_at": utc_now()
        })
        created = await self.venues.insert(venue_doc)
        return await self.get_venue(created["id"])

    async def get_venue(self, venue_id: str) -> dict:
        venue = await self.venues.find_by_id(venue_id)
        if not venue:
            raise NotFoundError("Venue not found")
        return venue

    async def list_venues(self, query: dict = None) -> list[dict]:
        return await self.venues.find_many(query or {})

    async def list_owner_venues(self, user_id: str) -> list[dict]:
        return await self.venues.find_many({"created_by": user_id})

    async def update_venue(self, venue_id: str, data: VenueUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            updated = await self.venues.update_by_id(venue_id, update_data)
            if not updated:
                raise NotFoundError("Venue not found")
        return await self.get_venue(venue_id)

    async def delete_venue(self, venue_id: str) -> None:
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
        slot_doc.setdefault("is_available", True)
        created = await self.slots.insert(slot_doc)
        return await self.get_slot(created["id"])

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

        start_date = datetime.strptime(data["start_date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(data["end_date"], "%Y-%m-%d").date()
        start_time = datetime.strptime(data["start_time"], "%H:%M").time()
        end_time = datetime.strptime(data["end_time"], "%H:%M").time()
        
        duration = timedelta(minutes=data.get("slot_duration_minutes", 60))
        price = data["price"]
        
        slots_created = []
        current_date = start_date
        
        while current_date <= end_date:
            current_dt = datetime.combine(current_date, start_time)
            end_dt = datetime.combine(current_date, end_time)
            
            while current_dt + duration <= end_dt:
                slot_end_dt = current_dt + duration
                
                slot_doc = {
                    "venue_id": venue_id,
                    "date": current_date.strftime("%Y-%m-%d"),
                    "start_time": current_dt.strftime("%H:%M"),
                    "end_time": slot_end_dt.strftime("%H:%M"),
                    "price": price,
                    "is_available": True
                }
                
                created = await self.slots.insert(slot_doc)
                slots_created.append(await self.get_slot(created["id"]))
                
                current_dt = slot_end_dt
                
            current_date += timedelta(days=1)
            
        return slots_created

    # Bookings
    async def create_booking(self, user_id: str, data: BookingCreateRequest) -> dict:
        from src.database.mongo import mongo
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

        try:
            booking_doc = data.model_dump(exclude_unset=True)
            booking_doc.update({
                "booked_by": user_id,
                "booking_status": "HELD",
                "created_at": utc_now()
            })

            mongo_client = mongo.client
            
            # Since Motor doesn't support transactions on standalone easily without a replica set,
            # we will try to use transactions. If it fails, fallback to simple operations.
            booking_id = None
            try:
                async with await mongo_client.start_session() as session:
                    async with session.start_transaction():
                        booking_id = await self.bookings.insert(booking_doc, session=session)
                        await self.slots.collection.update_one(
                            {"_id": ObjectId(data.slot_id)},
                            {"$set": {"is_available": False}},
                            session=session
                        )
            except Exception as e:
                # Fallback to non-transactional if replSet is not fully ready
                booking_id = await self.bookings.insert(booking_doc)
                await self.slots.collection.update_one(
                    {"_id": ObjectId(data.slot_id)},
                    {"$set": {"is_available": False}}
                )
            
            booking_id_str = booking_id["id"] if isinstance(booking_id, dict) else str(booking_id)

            # Return the HELD booking, waiting for payment confirmation
            return await self.get_booking(booking_id_str)
        finally:
            # Release lock after we have successfully persisted to DB (or failed)
            await redis_client.delete(lock_key)

    async def confirm_booking(self, booking_id: str, status: str = "CONFIRMED") -> dict:
        booking = await self.get_booking(booking_id)
        if booking.get("booking_status") == status:
            return booking
            
        await self.bookings.update_by_id(booking_id, {"booking_status": status})
        return await self.get_booking(booking_id)

    async def update_booking_status(self, booking_id: str, status: str, owner_id: str) -> dict:
        booking = await self.get_booking(booking_id)
        venue = await self.get_venue(booking["venue_id"])
        if venue.get("created_by") != owner_id:
            raise AppException(403, "Not authorized to update this booking")
            
        await self.bookings.update_by_id(booking_id, {"booking_status": status.upper()})
        if status.upper() in ["REJECTED", "CANCELLED"]:
            await self.slots.update_by_id(booking["slot_id"], {"is_available": True})
        return await self.get_booking(booking_id)

    async def get_booking(self, booking_id: str) -> dict:
        booking = await self.bookings.find_by_id(booking_id)
        if not booking:
            raise NotFoundError("Booking not found")
        return booking

    async def list_bookings(self, query: dict = None) -> list[dict]:
        bookings = await self.bookings.find_many(query or {})
        for b in bookings:
            # Resolve venue name
            if b.get("venue_id"):
                venue = await self.venues.find_by_id(b["venue_id"])
                b["venueName"] = venue.get("name", "Unknown Venue") if venue else "Unknown Venue"
                
            # Resolve slot label (time)
            if b.get("slot_id"):
                slot = await self.slots.find_by_id(b["slot_id"])
                if slot:
                    b["slotLabel"] = f'{slot.get("start_time")} - {slot.get("end_time")}'
                else:
                    b["slotLabel"] = "Unknown Time"
        return bookings

    async def list_owner_bookings(self, user_id: str) -> list[dict]:
        # Find all venues owned by this user
        owner_venues = await self.venues.find_many({"created_by": user_id})
        venue_ids = [str(v["id"]) for v in owner_venues]
        
        if not venue_ids:
            return []
            
        # Find bookings for these venues
        bookings = await self.bookings.find_many({"venue_id": {"$in": venue_ids}})
        
        # Resolve user names
        for b in bookings:
            try:
                user = await self.users.find_by_id(b["booked_by"])
                if user:
                    b["booked_by"] = user.get("full_name", b["booked_by"])
            except Exception:
                # Keep original ID or fallback if it's an invalid ObjectId
                pass
        
        return bookings

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

    async def create_payment_request(self, user_id: str, data: PaymentRequestCreateRequest) -> dict:
        group = await self.get_group(data.group_id)
        doc = data.model_dump(exclude_unset=True)
        doc.update({
            "created_by": user_id,
            "status": "Pending",
            "paid_count": 0,
            "total_members": group.get("member_count", 1),
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
        created = await self.payment_requests.insert(doc)
        return await self.get_payment_request(created["id"])

    async def list_payment_requests(self, group_id: str = None, user_id: str = None) -> list[dict]:
        query = {}
        if group_id:
            query["group_id"] = group_id
        elif user_id:
            user_groups = await self.list_groups(user_id)
            user_group_ids = [str(g["id"]) for g in user_groups if "id" in g]
            query = {
                "$or": [
                    {"created_by": user_id},
                    {"group_id": {"$in": user_group_ids}}
                ]
            }
        return await self.payment_requests.find_many(query, sort=[("created_at", -1)])

    async def get_payment_request(self, request_id: str) -> dict:
        req = await self.payment_requests.find_by_id(request_id)
        if not req:
            raise NotFoundError("Payment request not found")
        return req

    async def update_payment_request_status(self, request_id: str, status: str) -> dict:
        updated = await self.payment_requests.update_by_id(request_id, {
            "status": status,
            "paid_count": 1 if status == "Paid" else 0,
            "updated_at": utc_now()
        })
        if not updated:
            raise NotFoundError("Payment request not found")
        return updated

    # --- Polls ---
    async def create_poll(self, user_id: str, data: PollCreateRequest) -> dict:
        labels = data.option_labels or []
        if not labels and data.options:
            labels = [opt if isinstance(opt, str) else opt.get("label", "") for opt in data.options]
        
        creator = await self.users.find_by_id(user_id)
        created_by_name = creator.get("name", "You") if creator else "You"

        poll_doc = {
            "group_id": data.group_id,
            "question": data.question,
            "multiple_choice": data.multiple_choice,
            "expires_at": data.expires_at,
            "status": "Active",
            "created_by": created_by_name,
            "user_id": user_id,
            "voted_option_ids": [],
            "options": [{"id": uuid.uuid4().hex[:6], "label": label, "votes": 0} for label in labels],
            "created_at": utc_now(),
            "updated_at": utc_now(),
        }
        return await self.polls.insert(poll_doc)

    async def list_polls(self, group_id: str | None = None) -> list[dict]:
        query = {}
        if group_id:
            query["group_id"] = group_id
        return await self.polls.find_many(query, sort=[("created_at", -1)])

    async def get_poll(self, poll_id: str) -> dict:
        poll = await self.polls.find_by_id(poll_id)
        if not poll:
            raise NotFoundError("Poll not found")
        return poll

    async def vote_poll(self, poll_id: str, user_id: str, option_id: str) -> dict:
        poll = await self.get_poll(poll_id)
        if poll.get("status") != "Active":
            raise AppException(400, "Poll is closed")

        options = poll.get("options", [])
        voted_ids = list(poll.get("voted_option_ids", []))
        is_multiple = poll.get("multiple_choice", False)

        if is_multiple:
            for opt in options:
                if opt["id"] == option_id:
                    if option_id in voted_ids:
                        opt["votes"] = max(0, opt.get("votes", 0) - 1)
                        voted_ids.remove(option_id)
                    else:
                        opt["votes"] = opt.get("votes", 0) + 1
                        voted_ids.append(option_id)
                    break
        else:
            already_voted = option_id in voted_ids
            for opt in options:
                if opt["id"] in voted_ids:
                    opt["votes"] = max(0, opt.get("votes", 0) - 1)
            voted_ids = []
            if not already_voted:
                for opt in options:
                    if opt["id"] == option_id:
                        opt["votes"] = opt.get("votes", 0) + 1
                        voted_ids.append(option_id)
                        break

        updated = await self.polls.update_by_id(poll_id, {
            "options": options,
            "voted_option_ids": voted_ids,
            "updated_at": utc_now(),
        })
        return updated or poll

