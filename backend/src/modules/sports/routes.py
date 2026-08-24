from fastapi import APIRouter, Depends

from src.dependencies.auth import get_current_user
from src.services.sports_service import SportsService
from src.schemas.sports import (
    GroupCreateRequest, GroupUpdateRequest,
    AddMemberRequest, UpdateMemberRoleRequest,
    EventCreateRequest, EventUpdateRequest,
    RsvpRequest, MarkAttendanceRequest,
    VenueCreateRequest, VenueUpdateRequest,
    SlotCreateRequest, SlotUpdateRequest,
    BookingCreateRequest
)

router = APIRouter(prefix="/sports", tags=["Sports"])
service = SportsService()

# --- Groups ---
@router.post("/groups")
async def create_group(data: GroupCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    group = await service.create_group(user["id"], data)
    return {"status": "success", "data": group}

@router.get("/groups")
async def list_groups(_: dict = Depends(get_current_user)) -> dict:
    groups = await service.list_groups()
    return {"status": "success", "data": {"items": groups}}

@router.get("/groups/{id}")
async def get_group(id: str, _: dict = Depends(get_current_user)) -> dict:
    group = await service.get_group(id)
    return {"status": "success", "data": group}

@router.put("/groups/{id}")
async def update_group(id: str, data: GroupUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    group = await service.update_group(id, data)
    return {"status": "success", "data": group}

@router.delete("/groups/{id}")
async def delete_group(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_group(id)
    return {"status": "success"}

# --- Members ---
@router.post("/groups/{id}/members")
async def add_member(id: str, data: AddMemberRequest, _: dict = Depends(get_current_user)) -> dict:
    group = await service.add_member(id, data)
    return {"status": "success", "data": group}

@router.get("/groups/{id}/members")
async def list_members(id: str, _: dict = Depends(get_current_user)) -> dict:
    group = await service.get_group(id)
    return {"status": "success", "data": {"items": group.get("members", [])}}

@router.delete("/groups/{id}/members/{memberId}")
async def remove_member(id: str, memberId: str, _: dict = Depends(get_current_user)) -> dict:
    await service.remove_member(id, memberId)
    return {"status": "success"}

@router.put("/groups/{id}/members/{memberId}/role")
async def update_member_role(id: str, memberId: str, data: UpdateMemberRoleRequest, _: dict = Depends(get_current_user)) -> dict:
    await service.update_member_role(id, memberId, data)
    return {"status": "success"}

# --- Events ---
@router.post("/events")
async def create_event(data: EventCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    event = await service.create_event(user["id"], data)
    return {"status": "success", "data": event}

@router.get("/events")
async def list_events(_: dict = Depends(get_current_user)) -> dict:
    events = await service.list_events()
    return {"status": "success", "data": {"items": events}}

@router.get("/events/{id}")
async def get_event(id: str, _: dict = Depends(get_current_user)) -> dict:
    event = await service.get_event(id)
    return {"status": "success", "data": event}

@router.put("/events/{id}")
async def update_event(id: str, data: EventUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    event = await service.update_event(id, data)
    return {"status": "success", "data": event}

@router.delete("/events/{id}")
async def delete_event(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_event(id)
    return {"status": "success"}

# --- RSVP ---
@router.post("/events/{id}/rsvp")
async def rsvp_event(id: str, data: RsvpRequest, user: dict = Depends(get_current_user)) -> dict:
    rsvp = await service.rsvp_event(id, user["id"], data)
    return {"status": "success", "data": rsvp}

@router.get("/events/{id}/rsvp")
async def get_rsvps(id: str, _: dict = Depends(get_current_user)) -> dict:
    rsvps = await service.get_rsvps(id)
    return {"status": "success", "data": {"items": rsvps}}

# --- Attendance ---
@router.post("/attendance")
async def mark_attendance(data: MarkAttendanceRequest, user: dict = Depends(get_current_user)) -> dict:
    attendance = await service.mark_attendance(user["id"], data)
    return {"status": "success", "data": attendance}

@router.put("/attendance")
async def update_attendance(data: MarkAttendanceRequest, user: dict = Depends(get_current_user)) -> dict:
    attendance = await service.mark_attendance(user["id"], data)
    return {"status": "success", "data": attendance}

@router.get("/attendance")
async def get_attendance(eventId: str, _: dict = Depends(get_current_user)) -> dict:
    attendance = await service.get_attendance(eventId)
    return {"status": "success", "data": {"items": attendance}}

@router.get("/attendance/summary")
async def get_attendance_summary(eventId: str, _: dict = Depends(get_current_user)) -> dict:
    event = await service.get_event(eventId)
    return {"status": "success", "data": event.get("attendance", {})}

# --- Venues ---
@router.post("/venues")
async def create_venue(data: VenueCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    venue = await service.create_venue(user["id"], data)
    return {"status": "success", "data": venue}

@router.get("/venues")
async def list_venues(_: dict = Depends(get_current_user)) -> dict:
    venues = await service.list_venues()
    return {"status": "success", "data": {"items": venues}}

@router.get("/venues/{id}")
async def get_venue(id: str, _: dict = Depends(get_current_user)) -> dict:
    venue = await service.get_venue(id)
    return {"status": "success", "data": venue}

@router.put("/venues/{id}")
async def update_venue(id: str, data: VenueUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    venue = await service.update_venue(id, data)
    return {"status": "success", "data": venue}

@router.delete("/venues/{id}")
async def delete_venue(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_venue(id)
    return {"status": "success"}

# --- Slots ---
@router.post("/venues/{id}/slots")
async def create_slot(id: str, data: SlotCreateRequest, _: dict = Depends(get_current_user)) -> dict:
    slot = await service.create_slot(id, data)
    return {"status": "success", "data": slot}

@router.get("/venues/{id}/slots")
async def list_slots(id: str, date: str = None, _: dict = Depends(get_current_user)) -> dict:
    slots = await service.list_slots(id, date)
    return {"status": "success", "data": {"items": slots}}

@router.put("/slots/{id}")
async def update_slot(id: str, data: SlotUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    slot = await service.update_slot(id, data)
    return {"status": "success", "data": slot}

@router.delete("/slots/{id}")
async def delete_slot(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_slot(id)
    return {"status": "success"}

# --- Bookings ---
@router.post("/bookings")
async def create_booking(data: BookingCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.create_booking(user["id"], data)
    return {"status": "success", "data": booking}

@router.get("/bookings")
async def list_bookings(_: dict = Depends(get_current_user)) -> dict:
    bookings = await service.list_bookings()
    return {"status": "success", "data": {"items": bookings}}

@router.get("/bookings/history")
async def get_booking_history(user: dict = Depends(get_current_user)) -> dict:
    bookings = await service.list_bookings({"booked_by": user["id"]})
    return {"status": "success", "data": {"items": bookings}}

@router.get("/bookings/{id}")
async def get_booking(id: str, _: dict = Depends(get_current_user)) -> dict:
    booking = await service.get_booking(id)
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}/cancel")
async def cancel_booking(id: str, _: dict = Depends(get_current_user)) -> dict:
    booking = await service.cancel_booking(id)
    return {"status": "success", "data": booking}
