import asyncio
import uuid
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

import pytest
from src.database.mongo import mongo
from src.services.band_service import BandService
from src.services.notification_service import NotificationService
from src.repositories import UserRepository
from src.schemas.band import BookingRequest

def test_booking_notifications():
    async def _run():
        await mongo.connect()
        try:
            band_service = BandService()
            notif_service = NotificationService()
            user_repo = UserRepository()
            
            # 1. Create a Customer with a specific name
            customer_name = f"Client {uuid.uuid4().hex[:6]}"
            cust_doc = await user_repo.insert({
                "full_name": customer_name,
                "email": "cust@test.com",
                "role": "customer"
            })
            customer_id = cust_doc["id"]
            
            # 2. Create an Artist/Provider
            owner_doc = await user_repo.insert({
                "full_name": "Artist Owner",
                "email": "owner@test.com",
                "role": "artist"
            })
            owner_id = owner_doc["id"]
            
            package_id = f"pkg_{uuid.uuid4().hex[:8]}"
            artist_name = "Rocking Test Band"
            artist_profile = {
                "artist_name": artist_name,
                "packages": [
                    {"id": package_id, "name": "Basic Gig", "price": 50000, "duration": 120, "description": "-"}
                ]
            }
            artist = await band_service.upsert_artist_profile(owner_id, artist_profile)
            assert artist is not None
            provider_id = artist["id"]
            
            # 3. Customer books the artist
            event_date = "2026-11-20"
            booking_req = BookingRequest(
                provider_id=provider_id,
                provider_type="artist",
                package_id=package_id,
                event_date=event_date,
                event_time="19:00",
                message="Hi, I want to book you!"
            )
            
            await band_service.create_booking(customer_id, booking_req)
            
            # 4. Verify notification for the provider owner
            owner_notifs = await notif_service.list_notifications(owner_id)
            assert len(owner_notifs) > 0, "No notifications were created for the owner!"
            
            latest_notif = owner_notifs[0]
            assert latest_notif["title"] == "New Booking Request"
            
            # 5. Verify the message contains the customer name and provider name
            msg = latest_notif["message"]
            assert customer_name in msg, f"Customer name '{customer_name}' not found in notification message: '{msg}'"
            assert artist_name in msg, f"Artist name '{artist_name}' not found in notification message: '{msg}'"
            assert event_date in msg, f"Event date '{event_date}' not found in notification message: '{msg}'"
            
            print(f"\n[OK] Success: Notification correctly generated for provider with client details!")
            print(f"     Notification Message: \"{msg}\"")
            
        finally:
            await mongo.close()

    asyncio.run(_run())
