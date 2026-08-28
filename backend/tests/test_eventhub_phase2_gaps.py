import asyncio
from datetime import datetime, timezone, timedelta
import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

import pytest
from src.database.mongo import mongo, utc_now
from src.services.band_service import BandService
from src.schemas.band import (
    BandCreateRequest,
    BookingCreateRequest,
    CounterOfferRequest,
    BlackoutDatesRequest,
    ProviderOnboardingRequest,
)
from src.exceptions.handlers import AppException, NotFoundError

def test_eventhub_phase2_gap_closure_suite():
    async def _run():
        await mongo.connect()
        try:
            band_service = BandService()
            user_id = f"test_provider_user_{uuid.uuid4().hex[:8]}"
            customer_id = f"test_cust_{uuid.uuid4().hex[:8]}"
            unique_suffix = uuid.uuid4().hex[:6]

            # =========================================================================
            # GAP 3: UNIFIED PROVIDER ONBOARDING
            # =========================================================================
            # 1. Onboard a Band
            band_onboarding_payload = ProviderOnboardingRequest(
                provider_type="Band",
                name=f"Hyderabad Symphony {unique_suffix}",
                city="Hyderabad",
                contact_phone="+919876543210",
                bio="Electrifying live band for weddings and events",
                video_url="https://youtube.com/watch?v=sample",
                base_price=30000,
                sound_rider_specs="Requires 4 dynamic mics, DI boxes, and drum monitors",
                payout_upi="symphony@okhdfcbank",
                bank_account="123456789012",
                bank_ifsc="HDFC0001234",
                kyc_status="VERIFIED"
            )
            band_doc = await band_service.onboard_provider(user_id, band_onboarding_payload)
            band_id = band_doc["id"]
            assert band_doc["band_name"] == f"Hyderabad Symphony {unique_suffix}"
            assert band_doc["sound_rider_specs"] == "Requires 4 dynamic mics, DI boxes, and drum monitors"
            assert band_doc["payout_details"]["payout_upi"] == "symphony@okhdfcbank"
            assert band_doc["payout_details"]["bank_account_masked"] == "xxxx9012"
            assert band_doc["payout_details"]["kyc_status"] == "VERIFIED"

            # 2. Onboard an Artist
            artist_onboarding_payload = ProviderOnboardingRequest(
                provider_type="Artist",
                name=f"Rahul Vocalist {unique_suffix}",
                city="Hyderabad",
                base_price=10000,
                min_hours=2,
                travel_charges="₹2,000 outside city",
                payout_upi="rahul@oksbi"
            )
            artist_doc = await band_service.onboard_provider(user_id, artist_onboarding_payload)
            assert artist_doc["artist_name"] == f"Rahul Vocalist {unique_suffix}"
            assert artist_doc["min_hours"] == 2
            assert artist_doc["travel_charges"] == "₹2,000 outside city"

            # 3. Onboard a Venue
            venue_onboarding_payload = ProviderOnboardingRequest(
                provider_type="Venue",
                name=f"Royal Palace {unique_suffix}",
                city="Hyderabad",
                capacity=500,
                base_price=75000,
                security_deposit=20000,
                payout_upi="palace@okaxis"
            )
            venue_doc = await band_service.onboard_provider(user_id, venue_onboarding_payload)
            assert venue_doc["venue_name"] == f"Royal Palace {unique_suffix}"
            assert venue_doc["capacity"] == 500
            assert venue_doc["security_deposit"] == 20000

            # =========================================================================
            # GAP 2: PROVIDER BLACKOUT DATES & AVAILABILITY ENGINE
            # =========================================================================
            test_date = "2026-12-25"
            open_date = "2026-12-26"

            # Check availability before blackout
            is_avail_before = await band_service.check_provider_availability(band_id, test_date)
            assert is_avail_before is True, "Slot should initially be available"

            # Set blackout date
            updated_band = await band_service.update_blackout_dates(band_id, user_id, [test_date, "2026-12-31"])
            assert test_date in updated_band["blackout_dates"]
            assert "2026-12-31" in updated_band["blackout_dates"]

            # Verify availability engine returns False for blacked out date
            is_avail_blackout = await band_service.check_provider_availability(band_id, test_date)
            assert is_avail_blackout is False, "Blacked out date must return False for availability"

            # Verify open date is still available
            is_avail_open = await band_service.check_provider_availability(band_id, open_date)
            assert is_avail_open is True, "Non-blackout date must remain available"

            # Remove blackout date
            cleared_band = await band_service.update_blackout_dates(band_id, user_id, ["2026-12-31"])
            assert test_date not in cleared_band["blackout_dates"]
            is_avail_after_clear = await band_service.check_provider_availability(band_id, test_date)
            assert is_avail_after_clear is True, "Date should be available once blackout is removed"

            # =========================================================================
            # GAP 1: COUNTER OFFER WORKFLOW
            # =========================================================================
            # Create a booking request
            booking_req = BookingCreateRequest(
                provider_id=band_id,
                provider_type="Band",
                title="Wedding Celebration",
                event_date="2026-11-15",
                start_time="18:00",
                end_time="22:00",
                amount=20000
            )
            created_booking = await band_service.create_booking(customer_id, booking_req)
            booking_id = created_booking["id"]
            assert created_booking["booking_status"] == "REQUESTED"
            assert created_booking["amount"] == 20000

            # Provider submits counter offer: ₹28,000 with note
            counter_payload = CounterOfferRequest(
                amount=28000,
                note="Includes extra sound system and 1 additional set"
            )
            countered_booking = await band_service.counter_offer_booking(booking_id, user_id, counter_payload)

            # Assert booking is updated with counter offer details
            assert countered_booking["amount"] == 28000
            assert countered_booking["advance_amount"] == 7000  # 25% of 28000
            assert countered_booking["final_amount"] == 21000   # 75% of 28000
            assert countered_booking["counter_offer"]["proposed_amount"] == 28000
            assert countered_booking["counter_offer"]["note"] == "Includes extra sound system and 1 additional set"
            # Ensure counter offer did NOT prematurely confirm booking or start 15m soft-lock
            assert countered_booking["booking_status"] == "REQUESTED"
            assert countered_booking.get("accepted_at") is None

        finally:
            await mongo.close()

    asyncio.run(_run())
