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
from src.repositories import UserRepository
from src.schemas.band import BookingRequest, BookingStatus, PaymentStatus

def test_marketplace_booking_lifecycle():
    async def _run():
        await mongo.connect()
        try:
            band_service = BandService()
            user_repo = UserRepository()
            
            # 1. Create Customer
            customer_id = uuid.uuid4().hex[:24]
            await user_repo.insert({
                "id": customer_id,
                "full_name": "Test Customer",
                "email": f"{customer_id}@test.com",
                "role": "customer"
            })
            
            # 2. Create Venue with a package
            venue_user_id = uuid.uuid4().hex[:24]
            await user_repo.insert({
                "id": venue_user_id,
                "full_name": "Test Venue Owner",
                "email": f"{venue_user_id}@test.com",
                "role": "venue"
            })
            
            package_id = f"pkg_{uuid.uuid4().hex[:8]}"
            venue_profile_data = {
                "venue_name": "The Grand Test Arena for Booking",
                "packages": [
                    {"id": package_id, "name": "Full Day Rental", "price": 100000, "duration": 480, "description": "Full day"}
                ],
                "verification_status": "verified"
            }
            venue = await band_service.upsert_venue_profile(venue_user_id, venue_profile_data)
            assert venue is not None
            venue_id = venue["id"]
            
            # 3. Customer requests a booking
            booking_req = BookingRequest(
                provider_id=venue_id,
                provider_type="venue",
                package_id=package_id,
                event_date="2026-12-01",
                event_time="10:00",
                message="Looking forward to it!"
            )
            
            booking = await band_service.create_booking(customer_id, booking_req)
            assert booking is not None
            assert booking["status"] == BookingStatus.REQUESTED.value
            assert booking["payment_status"] == PaymentStatus.UNPAID.value
            assert booking["total_amount"] == 100000
            assert booking["advance_amount"] == 25000
            
            booking_id = booking["id"]
            
            # 4. Provider accepts booking
            updated_booking = await band_service.update_booking_status(booking_id, BookingStatus.ACCEPTED)
            assert updated_booking is not None
            assert updated_booking["status"] == BookingStatus.ACCEPTED.value
            
            # 5. Customer pays 25% advance
            updated_booking = await band_service.update_payment_status(booking_id, PaymentStatus.ADVANCE_PAID)
            assert updated_booking is not None
            assert updated_booking["payment_status"] == PaymentStatus.ADVANCE_PAID.value
            assert updated_booking["status"] == BookingStatus.CONFIRMED.value
            
            # 6. Provider marks event completed
            updated_booking = await band_service.update_booking_status(booking_id, BookingStatus.EVENT_COMPLETED)
            assert updated_booking is not None
            assert updated_booking["status"] == BookingStatus.EVENT_COMPLETED.value
            
            # 7. Customer pays remaining 75%
            updated_booking = await band_service.update_payment_status(booking_id, PaymentStatus.FULLY_PAID)
            assert updated_booking is not None
            assert updated_booking["payment_status"] == PaymentStatus.FULLY_PAID.value
            assert updated_booking["status"] == BookingStatus.COMPLETED.value
            
            print("\n[OK] Success: The end-to-end booking and payment milestone lifecycle works correctly.")
            
        finally:
            await mongo.close()

    asyncio.run(_run())
