from fastapi import APIRouter, Depends, Response
from fastapi.responses import HTMLResponse, JSONResponse

from src.dependencies.auth import get_current_user as _get_current_user
from src.constants.roles import ADMIN_ROLES
from src.exceptions.handlers import ForbiddenError

async def get_current_user(user: dict = Depends(_get_current_user)) -> dict:
    if user.get("role") not in ADMIN_ROLES and "sports" not in user.get("accessible_modules", []):
        raise ForbiddenError("Access to sports module denied")
    return user

from src.services.sports_service import SportsService
from src.schemas.sports import (
    GroupCreateRequest, GroupUpdateRequest,
    AddMemberRequest, UpdateMemberRoleRequest,
    EventCreateRequest, EventUpdateRequest,
    RsvpRequest, MarkAttendanceRequest,
    VenueCreateRequest, VenueUpdateRequest,
    SlotCreateRequest, SlotUpdateRequest,
    BookingCreateRequest, GenerateSlotsRequest,
    PaymentRequestCreateRequest, UpdateBookingStatusRequest,
    PollCreateRequest, PollVoteRequest
)

router = APIRouter(prefix="/sports", tags=["Sports"])
service = SportsService()

# --- Groups ---
@router.post("/groups")
async def create_group(data: GroupCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    group = await service.create_group(user["id"], data)
    return {"status": "success", "data": group}

@router.get("/groups")
async def list_groups(user: dict = Depends(get_current_user)) -> dict:
    groups = await service.list_groups(user["id"])
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
@router.get("/groups/invite/respond")
async def respond_to_invite(token: str, action: str = "accept", format: str = None) -> Response:
    result = await service.respond_to_invitation(token, action)
    if format == "json":
        return JSONResponse({"status": "success", "data": result})

    group_name = result.get("group_name", "the sports group")
    if action == "accept":
        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invitation Accepted</title>
  <style>
    body {{ background-color: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; }}
    .card {{ background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 28px 36px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 460px; width: 100%; }}
    .msg {{ font-size: 16px; font-weight: 700; color: #10b981; margin-bottom: 8px; line-height: 1.5; }}
    .sub {{ font-size: 12px; color: #64748b; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="msg">✓ Invitation accepted! You are now a confirmed member of {group_name}.</div>
    <div class="sub">This window will close automatically...</div>
  </div>
  <script>
    setTimeout(() => {{
      window.close();
    }}, 1800);
  </script>
</body>
</html>"""
    else:
        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invitation Declined</title>
  <style>
    body {{ background-color: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; }}
    .card {{ background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 28px 36px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 460px; width: 100%; }}
    .msg {{ font-size: 16px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; }}
    .sub {{ font-size: 12px; color: #64748b; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="msg">Invitation declined for {group_name}.</div>
    <div class="sub">This window will close automatically...</div>
  </div>
  <script>
    setTimeout(() => {{
      window.close();
    }}, 1800);
  </script>
</body>
</html>"""

    return HTMLResponse(content=html_content)

@router.post("/groups/invite/respond")
async def respond_to_invite_post(token: str, action: str = "accept") -> dict:
    result = await service.respond_to_invitation(token, action)
    return {"status": "success", "data": result}

@router.post("/groups/{id}/members")
async def add_member(id: str, data: AddMemberRequest, user: dict = Depends(get_current_user)) -> dict:
    group = await service.add_member(id, data, current_user=user)
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
async def list_events(group_id: str = None, user: dict = Depends(get_current_user)) -> dict:
    events = await service.list_events(group_id, user["id"])
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

@router.get("/venues/owner")
async def list_owner_venues(user: dict = Depends(get_current_user)) -> dict:
    venues = await service.list_owner_venues(user["id"])
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
async def delete_venue(id: str, user: dict = Depends(get_current_user)) -> dict:
    await service.delete_venue(id)
    return {"status": "success"}

@router.put("/venues/{id}/publish")
async def publish_venue(id: str, user: dict = Depends(get_current_user)) -> dict:
    venue = await service.update_venue(id, VenueUpdateRequest(status="Published"))
    return {"status": "success", "data": venue}

# --- Slots ---
@router.post("/venues/{id}/slots")
async def create_slot(id: str, data: SlotCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    slot = await service.create_slot(id, data, user["id"])
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

@router.post("/venues/{id}/slots/generate")
async def generate_slots(id: str, data: GenerateSlotsRequest, user: dict = Depends(get_current_user)) -> dict:
    slots = await service.generate_slots(id, data.model_dump(), user["id"])
    return {"status": "success", "data": {"items": slots}}

# --- Bookings ---
@router.post("/bookings")
async def create_booking(data: BookingCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.create_booking(user["id"], data)
    return {"status": "success", "data": booking}

@router.get("/bookings")
async def list_bookings(user: dict = Depends(get_current_user)) -> dict:
    bookings = await service.list_bookings({"booked_by": user["id"]})
    return {"status": "success", "data": {"items": bookings}}

@router.get("/bookings/owner")
async def list_owner_bookings(user: dict = Depends(get_current_user)) -> dict:
    bookings = await service.list_owner_bookings(user["id"])
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

@router.put("/bookings/{id}/confirm")
async def confirm_booking(id: str, status: str = "CONFIRMED", _: dict = Depends(get_current_user)) -> dict:
    booking = await service.confirm_booking(id, status)
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}/status")
async def update_booking_status(id: str, data: UpdateBookingStatusRequest, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.update_booking_status(id, data.status, user["id"])
    return {"status": "success", "data": booking}

# --- Payment Requests ---
@router.post("/payment-requests")
async def create_payment_request(data: PaymentRequestCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    req = await service.create_payment_request(user["id"], data)
    return {"status": "success", "data": req}

@router.get("/payment-requests")
async def list_payment_requests(group_id: str = None, user: dict = Depends(get_current_user)) -> dict:
    requests = await service.list_payment_requests(group_id, user["id"])
    return {"status": "success", "data": {"items": requests}}

@router.get("/payment-requests/{id}")
async def get_payment_request(id: str, _: dict = Depends(get_current_user)) -> dict:
    req = await service.get_payment_request(id)
    return {"status": "success", "data": req}

@router.put("/payment-requests/{id}/status")
async def update_payment_request_status(id: str, status: str = "Paid", _: dict = Depends(get_current_user)) -> dict:
    req = await service.update_payment_request_status(id, status)
    return {"status": "success", "data": req}

# --- Polls ---
@router.post("/polls")
async def create_poll(data: PollCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    poll = await service.create_poll(user["id"], data)
    return {"status": "success", "data": poll}

@router.get("/polls")
async def list_polls(group_id: str = None, _: dict = Depends(get_current_user)) -> dict:
    polls = await service.list_polls(group_id)
    return {"status": "success", "data": {"items": polls}}

@router.get("/polls/{id}")
async def get_poll(id: str, _: dict = Depends(get_current_user)) -> dict:
    poll = await service.get_poll(id)
    return {"status": "success", "data": poll}

@router.post("/polls/{id}/vote")
async def vote_poll(id: str, data: PollVoteRequest, user: dict = Depends(get_current_user)) -> dict:
    poll = await service.vote_poll(id, user["id"], data.option_id)
    return {"status": "success", "data": poll}


