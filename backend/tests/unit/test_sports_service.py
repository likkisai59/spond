"""Unit tests for SportsService (groups, members, events, venues, slots, bookings, payments)."""
import pytest
from bson import ObjectId
from src.services.sports_service import SportsService
from src.exceptions.handlers import AppException, NotFoundError
from src.schemas.sports import (
    GroupCreateRequest,
    GroupUpdateRequest,
    AddMemberRequest,
    UpdateMemberRoleRequest,
    EventCreateRequest,
    VenueCreateRequest,
    SlotCreateRequest,
    BookingCreateRequest,
    PaymentRequestCreateRequest,
)


@pytest.fixture
def sports_service():
    return SportsService()


@pytest.mark.asyncio
async def test_create_group_success(sports_service):
    user_id = str(ObjectId())
    req = GroupCreateRequest(
        name="Hyderabad Tigers FC",
        description="Amateur football team",
        sport_type="Football",
        category="Club",
        location="Hyderabad",
    )
    group = await sports_service.create_group(user_id=user_id, data=req)
    assert group["name"] == "Hyderabad Tigers FC"
    assert group["created_by"] == user_id
    assert group["member_count"] == 1
    assert len(group["members"]) == 1
    assert group["members"][0]["role"] == "Owner"


@pytest.mark.asyncio
async def test_create_group_duplicate_name(sports_service):
    user_id = str(ObjectId())
    req = GroupCreateRequest(
        name="Duplicate Warriors",
        description="First team",
        sport_type="Cricket",
        category="Club",
    )
    await sports_service.create_group(user_id=user_id, data=req)

    with pytest.raises(AppException) as exc_info:
        await sports_service.create_group(user_id=user_id, data=req)
    assert exc_info.value.status_code == 400
    assert "already exists" in str(exc_info.value.message)


@pytest.mark.asyncio
async def test_group_member_lifecycle(sports_service):
    owner_id = str(ObjectId())
    group = await sports_service.create_group(
        user_id=owner_id,
        data=GroupCreateRequest(name="Avengers FC", description="Desc"),
    )
    group_id = group["id"]

    # Add new member
    member_user_id = str(ObjectId())
    await sports_service.add_member(
        group_id=group_id,
        data=AddMemberRequest(
            user_id=member_user_id,
            name="John Striker",
            email="john@example.com",
            role="Player",
        ),
        current_user={"full_name": "Club Owner"},
    )

    # Verify member added
    members = await sports_service.members.find_many({"group_id": group_id})
    assert len(members) == 2
    added = next(m for m in members if m["email"] == "john@example.com")
    assert added["role"] == "Player"
    assert added["status"] == "Pending"
    assert "invite_token" in added

    # Update role
    await sports_service.update_member_role(
        group_id=group_id,
        member_id=member_user_id,
        data=UpdateMemberRoleRequest(role="Coach"),
    )
    updated = await sports_service.members.find_one({"group_id": group_id, "user_id": member_user_id})
    assert updated["role"] == "Coach"

    # Remove member
    await sports_service.remove_member(group_id=group_id, member_id=member_user_id)
    remaining = await sports_service.members.find_many({"group_id": group_id})
    assert len(remaining) == 1


@pytest.mark.asyncio
async def test_invitation_respond_lifecycle(sports_service):
    owner_id = str(ObjectId())
    group = await sports_service.create_group(
        user_id=owner_id,
        data=GroupCreateRequest(name="Warriors XI", description="Cricket"),
    )
    group_id = group["id"]

    await sports_service.add_member(
        group_id=group_id,
        data=AddMemberRequest(name="Invited Member", email="invite@example.com", role="Player"),
    )
    member_record = await sports_service.members.find_one({"email": "invite@example.com"})
    token = member_record["invite_token"]

    # Accept invitation
    accept_res = await sports_service.respond_to_invitation(token=token, action="accept")
    assert accept_res["status"] == "success"
    assert accept_res["action"] == "accepted"

    confirmed_member = await sports_service.members.find_one({"invite_token": token})
    assert confirmed_member["status"] == "Confirmed"

    # Invalid token raises NotFoundError
    with pytest.raises(NotFoundError):
        await sports_service.respond_to_invitation(token="non_existent_token_123", action="accept")


@pytest.mark.asyncio
async def test_event_lifecycle(sports_service):
    user_id = str(ObjectId())
    group = await sports_service.create_group(
        user_id=user_id,
        data=GroupCreateRequest(name="Event Group", description="Desc"),
    )
    group_id = group["id"]

    # Create event
    event = await sports_service.create_event(
        user_id=user_id,
        data=EventCreateRequest(
            group_id=group_id,
            title="Saturday Practice",
            date="2026-10-15",
            start_time="07:00",
            end_time="09:00",
            location="Main Stadium",
            type="Training",
        ),
    )
    assert event["title"] == "Saturday Practice"
    assert event["attendance"]["going"] == 0
    assert event["attendance"]["maybe"] == 0

    # Retrieve event
    fetched = await sports_service.get_event(event["id"])
    assert fetched["id"] == event["id"]
    assert fetched["status"] == "Upcoming"


@pytest.mark.asyncio
async def test_venue_and_slots(sports_service):
    owner_id = str(ObjectId())
    other_user_id = str(ObjectId())

    # Create venue
    venue = await sports_service.create_venue(
        user_id=owner_id,
        data=VenueCreateRequest(
            name="City Arena",
            description="Turf arena",
            sport_type="Football",
            address="123 Sport Way",
            city="Hyderabad",
        ),
    )
    venue_id = venue["id"]

    # Unauthorized user cannot add slots
    with pytest.raises(AppException) as exc_info:
        await sports_service.create_slot(
            venue_id=venue_id,
            data=SlotCreateRequest(date="2026-10-15", start_time="06:00", end_time="07:00", price=1200.0),
            user_id=other_user_id,
        )
    assert exc_info.value.status_code == 403

    # Venue owner can create slot
    slot = await sports_service.create_slot(
        venue_id=venue_id,
        data=SlotCreateRequest(date="2026-10-15", start_time="06:00", end_time="07:00", price=1200.0),
        user_id=owner_id,
    )
    assert slot["venue_id"] == venue_id
    assert slot["price"] == 1200.0
    assert slot["is_available"] is True

    # Bulk slot generator
    slots = await sports_service.generate_slots(
        venue_id=venue_id,
        data={
            "start_date": "2026-10-16",
            "end_date": "2026-10-16",
            "start_time": "08:00",
            "end_time": "11:00",
            "slot_duration_minutes": 60,
            "price": 1000.0,
        },
        user_id=owner_id,
    )
    assert len(slots) == 3


@pytest.mark.asyncio
async def test_booking_lifecycle(sports_service):
    owner_id = str(ObjectId())
    booker_id = str(ObjectId())

    # Create venue & slot
    venue = await sports_service.create_venue(
        user_id=owner_id,
        data=VenueCreateRequest(name="Park Pitch", description="Pitch", address="Main Rd", city="Hyd"),
    )
    slot = await sports_service.create_slot(
        venue_id=venue["id"],
        data=SlotCreateRequest(date="2026-10-20", start_time="10:00", end_time="11:00", price=1500.0),
        user_id=owner_id,
    )
    slot_id = slot["id"]

    # Book slot
    booking = await sports_service.create_booking(
        user_id=booker_id,
        data=BookingCreateRequest(venue_id=venue["id"], slot_id=slot_id, amount=1500.0),
    )
    assert booking["booking_status"] == "HELD"
    assert booking["booked_by"] == booker_id

    # Verify slot is no longer available
    slot_after = await sports_service.get_slot(slot_id)
    assert slot_after["is_available"] is False

    # Second booking attempt on same slot fails
    with pytest.raises(AppException) as exc_info:
        await sports_service.create_booking(
            user_id=str(ObjectId()),
            data=BookingCreateRequest(venue_id=venue["id"], slot_id=slot_id, amount=1500.0),
        )
    assert "not available" in str(exc_info.value.message)

    # Confirm booking
    confirmed = await sports_service.confirm_booking(booking["id"])
    assert confirmed["booking_status"] == "CONFIRMED"

    # Cancel booking frees up slot
    cancelled = await sports_service.cancel_booking(booking["id"])
    assert cancelled["booking_status"] == "CANCELLED"

    slot_freed = await sports_service.get_slot(slot_id)
    assert slot_freed["is_available"] is True


@pytest.mark.asyncio
async def test_payment_request_lifecycle(sports_service):
    user_id = str(ObjectId())
    group = await sports_service.create_group(
        user_id=user_id,
        data=GroupCreateRequest(name="Tournament Squad", description="Desc"),
    )
    group_id = group["id"]

    pr = await sports_service.create_payment_request(
        user_id=user_id,
        data=PaymentRequestCreateRequest(
            group_id=group_id,
            title="Tournament Entry Fee",
            amount=500.0,
            due_date="2026-11-01",
            description="Entry fee per member",
        ),
    )
    assert pr["title"] == "Tournament Entry Fee"
    assert pr["status"] == "Pending"

    # Update status to Paid
    updated = await sports_service.update_payment_request_status(pr["id"], "Paid")
    assert updated["status"] == "Paid"
    assert updated["paid_count"] == 1
