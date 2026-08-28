import asyncio
from datetime import datetime, timezone, timedelta
import hmac
import hashlib
import json
import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("RAZORPAY_WEBHOOK_SECRET", "test-webhook-secret-12345")

import pytest
import httpx
from src.app.main import app
from src.core.config import settings
from src.database.mongo import mongo, utc_now
from src.services.payment_service import PaymentService
from src.services.band_service import BandService
from src.schemas.band import BookingCreateRequest, BookingUpdateRequest, ProviderOnboardingRequest
from src.schemas.payments import CreateOrderRequest, VerifyPaymentRequest
from src.core.security import create_access_token
from src.repositories import UserRepository

def _compute_webhook_signature(payload_bytes: bytes, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()

def test_payments_auth_and_webhook_hardening_suite():
    async def _run():
        await mongo.connect()
        try:
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
                payment_service = PaymentService()
                band_service = BandService()
                user_repo = UserRepository()
                unique_suffix = uuid.uuid4().hex[:6]

                # -------------------------------------------------------------------------
                # 1. TEST: Unauthenticated Payment Requests are Rejected (Mock Auth Removed)
                # -------------------------------------------------------------------------
                res_no_auth = await client.post("/api/v1/payments/create-order", json={
                    "amount": 5000,
                    "currency": "INR",
                    "module": "band",
                    "module_id": "some_booking_id"
                })
                assert res_no_auth.status_code in [401, 403], "Unauthenticated create-order must be rejected"

                res_history_no_auth = await client.get("/api/v1/payments/history")
                assert res_history_no_auth.status_code in [401, 403], "Unauthenticated payment history must be rejected"

                # -------------------------------------------------------------------------
                # 2. TEST: Authenticated Payment Request with valid JWT works
                # -------------------------------------------------------------------------
                user_doc = await user_repo.insert({
                    "email": f"payer_{unique_suffix}@example.com",
                    "password_hash": "dummy_hash",
                    "full_name": "Hardened Customer",
                    "role": "member",
                    "accessible_modules": ["band", "eventhub", "sports"],
                    "is_active": True,
                    "is_deleted": False,
                    "created_at": utc_now(),
                    "updated_at": utc_now()
                })
                user_id = user_doc["id"]
                token, _ = create_access_token(user_id, user_doc["email"], user_doc["role"], user_doc["accessible_modules"])
                auth_headers = {"Authorization": f"Bearer {token}"}

                # Setup provider & booking
                band_doc = await band_service.onboard_provider(user_id, ProviderOnboardingRequest(
                    provider_type="Band",
                    name=f"Hardened Band {unique_suffix}",
                    city="Hyderabad",
                    base_price=20000
                ))
                band_id = band_doc["id"]

                booking = await band_service.create_booking(user_id, BookingCreateRequest(
                    provider_id=band_id,
                    provider_type="Band",
                    title="Grand Hardened Event",
                    event_date="2026-12-10",
                    amount=20000
                ))
                booking_id = booking["id"]

                # Provider accepts booking -> sets ACCEPTED and starts 15m window
                await band_service.accept_booking(booking_id, user_id)
                accepted_booking = await band_service.get_booking(booking_id)
                assert accepted_booking["booking_status"] == "ACCEPTED"

                # Customer creates 25% advance order with valid token
                res_order = await client.post("/api/v1/payments/create-order", json={
                    "amount": 5000,
                    "currency": "INR",
                    "module": "band",
                    "module_id": booking_id,
                    "milestone": "advance"
                }, headers=auth_headers)
                assert res_order.status_code == 200
                order_data = res_order.json()["data"]
                razorpay_order_id = order_data["razorpay_order_id"]
                payment_record_id = order_data["id"]

                # -------------------------------------------------------------------------
                # 3. TEST: Webhook with Invalid Signature is Rejected
                # -------------------------------------------------------------------------
                webhook_payload = {
                    "event": "payment.captured",
                    "payload": {
                        "payment": {
                            "entity": {
                                "id": f"pay_webhook_{unique_suffix}",
                                "order_id": razorpay_order_id,
                                "amount": 500000,
                                "status": "captured"
                            }
                        }
                    }
                }
                webhook_bytes = json.dumps(webhook_payload).encode("utf-8")

                res_bad_sig = await client.post(
                    "/api/v1/payments/webhook",
                    content=webhook_bytes,
                    headers={"X-Razorpay-Signature": "invalid_bogus_signature", "Content-Type": "application/json"}
                )
                assert res_bad_sig.status_code == 400
                assert "Invalid webhook signature" in res_bad_sig.text

                # -------------------------------------------------------------------------
                # 4. TEST: Valid Razorpay Webhook Reconciles & Confirms Booking
                # -------------------------------------------------------------------------
                valid_sig = _compute_webhook_signature(
                    webhook_bytes,
                    settings.RAZORPAY_WEBHOOK_SECRET or settings.RAZORPAY_KEY_SECRET or "test-webhook-secret-12345"
                )

                res_valid_hook = await client.post(
                    "/api/v1/payments/webhook",
                    content=webhook_bytes,
                    headers={"X-Razorpay-Signature": valid_sig, "Content-Type": "application/json"}
                )
                assert res_valid_hook.status_code == 200
                hook_result = res_valid_hook.json()
                assert hook_result["status"] == "success"
                assert hook_result["data"]["status"] == "reconciled"

                # Verify local payment is SUCCESS and booking is CONFIRMED & ADVANCE_PAID
                confirmed_booking = await band_service.get_booking(booking_id)
                assert confirmed_booking["booking_status"] == "CONFIRMED"
                assert confirmed_booking["payment_status"] == "ADVANCE_PAID"

                # -------------------------------------------------------------------------
                # 5. TEST: Webhook Idempotency (Duplicate Webhooks do not duplicate side effects)
                # -------------------------------------------------------------------------
                res_duplicate_hook = await client.post(
                    "/api/v1/payments/webhook",
                    content=webhook_bytes,
                    headers={"X-Razorpay-Signature": valid_sig, "Content-Type": "application/json"}
                )
                assert res_duplicate_hook.status_code == 200
                dup_data = res_duplicate_hook.json()["data"]
                assert dup_data["status"] == "idempotent_ok"

                # -------------------------------------------------------------------------
                # 6. TEST: Unknown Order / Payment Webhook Handled Safely
                # -------------------------------------------------------------------------
                unknown_payload = {
                    "event": "payment.captured",
                    "payload": {
                        "payment": {
                            "entity": {
                                "id": "pay_unknown_999",
                                "order_id": "order_unknown_999",
                                "amount": 100000,
                                "status": "captured"
                            }
                        }
                    }
                }
                unknown_bytes = json.dumps(unknown_payload).encode("utf-8")
                unknown_sig = _compute_webhook_signature(
                    unknown_bytes,
                    settings.RAZORPAY_WEBHOOK_SECRET or settings.RAZORPAY_KEY_SECRET or "test-webhook-secret-12345"
                )
                res_unknown = await client.post(
                    "/api/v1/payments/webhook",
                    content=unknown_bytes,
                    headers={"X-Razorpay-Signature": unknown_sig, "Content-Type": "application/json"}
                )
                assert res_unknown.status_code == 200
                assert res_unknown.json()["data"]["status"] == "ignored"

                # -------------------------------------------------------------------------
                # 7. TEST: Captured Payment After 15-Minute TTL Triggers Automatic Refund
                # -------------------------------------------------------------------------
                expired_booking = await band_service.create_booking(user_id, BookingCreateRequest(
                    provider_id=band_id,
                    provider_type="Band",
                    title="Expired Window Event",
                    event_date="2026-12-15",
                    amount=20000
                ))
                exp_booking_id = expired_booking["id"]

                # Set accepted_at to 20 minutes ago
                past_time = utc_now() - timedelta(minutes=20)
                await band_service.bookings.update_by_id(exp_booking_id, {
                    "booking_status": "ACCEPTED",
                    "payment_status": "ADVANCE_PAYMENT_PENDING",
                    "accepted_at": past_time
                })

                # Create advance payment order
                exp_order = await payment_service.create_order(user_id, CreateOrderRequest(
                    amount=5000,
                    currency="INR",
                    module="band",
                    module_id=exp_booking_id,
                    milestone="advance"
                ))
                exp_order_id = exp_order["razorpay_order_id"]

                # Webhook delivers payment captured for this expired booking
                exp_webhook_payload = {
                    "event": "payment.captured",
                    "payload": {
                        "payment": {
                            "entity": {
                                "id": f"pay_expired_{unique_suffix}",
                                "order_id": exp_order_id,
                                "amount": 500000,
                                "status": "captured"
                            }
                        }
                    }
                }
                exp_webhook_bytes = json.dumps(exp_webhook_payload).encode("utf-8")
                exp_sig = _compute_webhook_signature(
                    exp_webhook_bytes,
                    settings.RAZORPAY_WEBHOOK_SECRET or settings.RAZORPAY_KEY_SECRET or "test-webhook-secret-12345"
                )

                res_exp_hook = await client.post(
                    "/api/v1/payments/webhook",
                    content=exp_webhook_bytes,
                    headers={"X-Razorpay-Signature": exp_sig, "Content-Type": "application/json"}
                )
                assert res_exp_hook.status_code == 200
                exp_res_data = res_exp_hook.json()["data"]
                assert exp_res_data["status"] == "reconciliation_rejected"
                assert "15-minute advance payment window for this booking has expired" in exp_res_data["reason"]

                # Booking must NOT be confirmed
                final_exp_booking = await band_service.get_booking(exp_booking_id)
                assert final_exp_booking["booking_status"] != "CONFIRMED"

                # Payment must be recorded as REFUNDED
                exp_payment_doc = await payment_service.payments.find_one({"order_id": exp_order_id})
                assert exp_payment_doc["payment_status"] == "REFUNDED"

        finally:
            await mongo.close()

    asyncio.run(_run())
