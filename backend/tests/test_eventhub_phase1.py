import asyncio
from datetime import datetime, timezone, timedelta
import hmac
import hashlib
import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

import pytest
from pydantic import ValidationError
from src.core.config import settings
from src.database.mongo import mongo, utc_now
from src.services.eventhub_service import EventHubService
from src.services.band_service import BandService
from src.services.payment_service import PaymentService
from src.repositories.band import BandVenueBookingRepository
from src.schemas.eventhub import EventHubEventCreateRequest, EventHubEventUpdateRequest
from src.schemas.band import BandCreateRequest, BookingCreateRequest, BookingUpdateRequest
from src.schemas.payments import CreateOrderRequest, VerifyPaymentRequest
from src.exceptions.handlers import AppException, ForbiddenError

def _compute_valid_signature(order_id: str, payment_id: str) -> str:
    key = (settings.RAZORPAY_KEY_SECRET or "dummy_secret").encode()
    msg = f"{order_id}|{payment_id}".encode()
    return hmac.new(key, msg, hashlib.sha256).hexdigest()

def test_eventhub_full_phase1_hardening_suite():
    async def _run():
        await mongo.connect()
        try:
            event_service = EventHubService()
            band_service = BandService()
            payment_service = PaymentService()
            booking_repo = BandVenueBookingRepository()
            user_id = f"test_customer_{uuid.uuid4().hex[:8]}"
            other_user_id = f"unauthorized_user_{uuid.uuid4().hex[:8]}"
            unique_suffix = uuid.uuid4().hex[:6]

            # =========================================================================
            # SCENARIO 9: Index on event_id exists
            # =========================================================================
            await booking_repo.ensure_indexes()
            indexes = await booking_repo.collection.index_information()
            assert any("event_id" in idx.get("key", [("", 0)])[0] for idx in indexes.values()), "event_id index MUST exist on band_bookings"

            # =========================================================================
            # SCENARIO 10: Invalid provider_type rejected by Pydantic
            # =========================================================================
            with pytest.raises(ValidationError):
                BookingCreateRequest(
                    provider_id="some_id",
                    provider_type="Dancer",  # Invalid type not in Literal["Venue", "Artist", "Band"]
                    title="Invalid Provider Gig",
                    amount=50000
                )

            # =========================================================================
            # SCENARIO 11: Valid provider_type values ("Venue", "Artist", "Band") accepted
            # =========================================================================
            req_venue = BookingCreateRequest(provider_id="v_1", provider_type="Venue", title="Venue Booking", amount=10000)
            assert req_venue.provider_type == "Venue"
            req_artist = BookingCreateRequest(provider_id="a_1", provider_type="Artist", title="Artist Booking", amount=10000)
            assert req_artist.provider_type == "Artist"
            req_band = BookingCreateRequest(provider_id="b_1", provider_type="Band", title="Band Booking", amount=10000)
            assert req_band.provider_type == "Band"

            # =========================================================================
            # SCENARIO 12: Legacy band_id / venue_id booking payloads continue to work
            # =========================================================================
            legacy_req = BookingCreateRequest(
                band_id="legacy_band_999",
                title="Old Style Band Booking",
                event_date="2026-11-20",
                amount=50000
            )
            assert legacy_req.band_id == "legacy_band_999"

            # =========================================================================
            # EVENT & BAND SETUP
            # =========================================================================
            event_payload = EventHubEventCreateRequest(
                title=f"Varun's Grand Reception {unique_suffix}",
                date="2026-10-15",
                location="Hyderabad",
                guest_count=300,
                budget=200000,
                event_type="Reception"
            )
            event = await event_service.create_event(user_id, event_payload)
            event_id = event["id"]

            with pytest.raises(ForbiddenError):
                await event_service.get_event(event_id, other_user_id)

            band_name = f"The Hyderabad Fusion Ensembles {unique_suffix}"
            band_payload = BandCreateRequest(
                band_name=band_name,
                description="Top fusion rock band",
                members=6,
                instrument_lineup={"drummers": 2, "trumpets": 2, "singers": 1, "keyboards": 1},
                packages=[{"id": "pkg_live", "title": "Full Concert", "price": 100000, "duration_minutes": 150}]
            )
            band = await band_service.create_band("provider_band_leader", band_payload)
            band_id = band["id"]

            booking_payload = BookingCreateRequest(
                event_id=event_id,
                provider_id=band_id,
                provider_type="Band",
                provider_name=band_name,
                title="Reception Live Performance",
                event_date="2026-10-15",
                start_time="19:00",
                end_time="22:00",
                amount=100000
            )
            booking = await band_service.create_booking(user_id, booking_payload)
            booking_id = booking["id"]

            # Provider Accepts -> Soft-lock window begins
            accepted_booking = await band_service.accept_booking(booking_id, "provider_band_leader")
            assert accepted_booking["booking_status"] == "ACCEPTED"
            assert accepted_booking["payment_status"] == "ADVANCE_PAYMENT_PENDING"

            # =========================================================================
            # SCENARIO 1: ACCEPTED booking at 10 minutes (slot remains blocked)
            # =========================================================================
            ten_mins_ago = utc_now() - timedelta(minutes=10)
            await band_service.bookings.update_by_id(booking_id, {"accepted_at": ten_mins_ago})

            is_avail_10min = await band_service.check_provider_availability(
                provider_id=band_id,
                event_date="2026-10-15",
                start_time="20:00",
                end_time="21:00"
            )
            assert is_avail_10min is False, "Slot MUST be blocked at 10 minutes"

            # =========================================================================
            # SCENARIO 2: ACCEPTED booking at 16 minutes (slot becomes available)
            # =========================================================================
            sixteen_mins_ago = utc_now() - timedelta(minutes=16)
            await band_service.bookings.update_by_id(booking_id, {"accepted_at": sixteen_mins_ago})

            is_avail_16min = await band_service.check_provider_availability(
                provider_id=band_id,
                event_date="2026-10-15",
                start_time="20:00",
                end_time="21:00"
            )
            assert is_avail_16min is True, "Slot MUST be available at 16 minutes"

            # =========================================================================
            # SCENARIO 3: ACCEPTED booking exactly at 15 minutes (slot becomes available)
            # =========================================================================
            exact_15min_ago = utc_now() - timedelta(minutes=15)
            await band_service.bookings.update_by_id(booking_id, {"accepted_at": exact_15min_ago})

            is_avail_exact = await band_service.check_provider_availability(
                provider_id=band_id,
                event_date="2026-10-15",
                start_time="20:00",
                end_time="21:00"
            )
            assert is_avail_exact is True, "Slot MUST be available at exact 15-minute boundary"

            # =========================================================================
            # SCENARIO 8: CONFIRMED booking remains a hard slot lock
            # =========================================================================
            two_hours_ago = utc_now() - timedelta(hours=2)
            await band_service.bookings.update_by_id(booking_id, {
                "booking_status": "CONFIRMED",
                "payment_status": "ADVANCE_PAID",
                "accepted_at": two_hours_ago
            })
            is_avail_confirmed = await band_service.check_provider_availability(
                provider_id=band_id,
                event_date="2026-10-15",
                start_time="20:00",
                end_time="21:00"
            )
            assert is_avail_confirmed is False, "CONFIRMED booking MUST hard-lock regardless of age"

            # Reset booking to ACCEPTED for refund and payment testing
            await band_service.bookings.update_by_id(booking_id, {
                "booking_status": "ACCEPTED",
                "payment_status": "ADVANCE_PAYMENT_PENDING"
            })

            # =========================================================================
            # SCENARIO 5: Advance payment after 15 minutes triggers automatic refund
            # =========================================================================
            twenty_mins_ago = utc_now() - timedelta(minutes=20)
            await band_service.bookings.update_by_id(booking_id, {"accepted_at": twenty_mins_ago})

            expired_order = await payment_service.create_order(user_id, CreateOrderRequest(
                module="band",
                module_id=booking_id,
                amount=25000,
                milestone="advance"
            ))
            expired_sig = _compute_valid_signature(expired_order["razorpay_order_id"], "pay_expired_123")

            with pytest.raises(AppException) as ttl_err:
                await payment_service.verify_signature(VerifyPaymentRequest(
                    razorpay_order_id=expired_order["razorpay_order_id"],
                    razorpay_payment_id="pay_expired_123",
                    razorpay_signature=expired_sig,
                    payment_id=expired_order["id"],
                    milestone="advance"
                ))
            assert "automatically refunded" in str(ttl_err.value.message)

            # Booking must remain unconfirmed
            unconfirmed_bkg = await band_service.get_booking(booking_id)
            assert unconfirmed_bkg["booking_status"] == "ACCEPTED"
            assert unconfirmed_bkg["payment_status"] == "ADVANCE_PAYMENT_PENDING"

            # Payment record must be marked REFUNDED
            refunded_payment = await payment_service.get_payment(expired_order["id"])
            assert refunded_payment["payment_status"] == "REFUNDED"

            # =========================================================================
            # SCENARIO 6: Idempotent retried verification for already-refunded payment
            # =========================================================================
            with pytest.raises(AppException) as retry_err:
                await payment_service.verify_signature(VerifyPaymentRequest(
                    razorpay_order_id=expired_order["razorpay_order_id"],
                    razorpay_payment_id="pay_expired_123",
                    razorpay_signature=expired_sig,
                    payment_id=expired_order["id"],
                    milestone="advance"
                ))
            assert "already been refunded" in str(retry_err.value.message)

            # =========================================================================
            # SCENARIO 7: Gateway refund failure preserves reconciliation info
            # =========================================================================
            failed_order = await payment_service.create_order(user_id, CreateOrderRequest(
                module="band",
                module_id=booking_id,
                amount=25000,
                milestone="advance"
            ))
            failed_sig = _compute_valid_signature(failed_order["razorpay_order_id"], "pay_failed_456")

            # Mock a failing client refund call
            class MockFailingRazorpayClient:
                class MockPayment:
                    def refund(self, *args, **kwargs):
                        raise Exception("Gateway connection timeout")
                def __init__(self):
                    self.payment = self.MockPayment()
                    self.utility = payment_service.client.utility if payment_service.client else None

            orig_client = payment_service.client
            payment_service.client = MockFailingRazorpayClient()
            try:
                with pytest.raises(AppException) as rf_fail_err:
                    await payment_service.verify_signature(VerifyPaymentRequest(
                        razorpay_order_id=failed_order["razorpay_order_id"],
                        razorpay_payment_id="pay_failed_456",
                        razorpay_signature=failed_sig,
                        payment_id=failed_order["id"],
                        milestone="advance"
                    ))
                assert "Gateway connection timeout" in str(rf_fail_err.value.message)

                # Payment record must capture REFUND_FAILED for admin reconciliation
                failed_payment = await payment_service.get_payment(failed_order["id"])
                assert failed_payment["payment_status"] == "REFUND_FAILED"
                assert "Gateway connection timeout" in failed_payment.get("refund_error", "")
            finally:
                payment_service.client = orig_client

            # =========================================================================
            # SCENARIO 4: Advance payment within 15 minutes succeeds cleanly
            # =========================================================================
            five_mins_ago = utc_now() - timedelta(minutes=5)
            await band_service.bookings.update_by_id(booking_id, {"accepted_at": five_mins_ago})

            valid_order = await payment_service.create_order(user_id, CreateOrderRequest(
                module="band",
                module_id=booking_id,
                amount=25000,
                milestone="advance"
            ))
            valid_sig = _compute_valid_signature(valid_order["razorpay_order_id"], "pay_valid_789")

            verified_payment = await payment_service.verify_signature(VerifyPaymentRequest(
                razorpay_order_id=valid_order["razorpay_order_id"],
                razorpay_payment_id="pay_valid_789",
                razorpay_signature=valid_sig,
                payment_id=valid_order["id"],
                milestone="advance"
            ))
            assert verified_payment["payment_status"] == "SUCCESS"

            confirmed_bkg = await band_service.get_booking(booking_id)
            assert confirmed_bkg["booking_status"] == "CONFIRMED"
            assert confirmed_bkg["payment_status"] == "ADVANCE_PAID"

            # Cleanup
            await band_service.delete_booking(booking_id)
            await band_service.delete_band(band_id)
            await event_service.events.delete_by_id(event_id)
        finally:
            await mongo.close()

    asyncio.run(_run())
