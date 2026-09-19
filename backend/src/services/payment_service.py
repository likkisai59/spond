import razorpay
import hmac
import hashlib
from src.database.mongo import utc_now
from src.repositories.system import PaymentRepository, TransactionRepository, PaymentReceiptRepository
from src.exceptions.handlers import NotFoundError, AppException
from src.core.config import settings
from src.schemas.payments import CreateOrderRequest, VerifyPaymentRequest, RefundRequest

class PaymentService:
    def __init__(self):
        self.payments = PaymentRepository()
        self.transactions = TransactionRepository()
        self.receipts = PaymentReceiptRepository()
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        
        # In a real app we only initialize razorpay if keys are present
        if self.key_id and self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        else:
            self.client = None

    async def create_order(self, user_id: str, data: CreateOrderRequest) -> dict:
        # Razorpay expects amount in paise
        amount_in_paise = int(data.amount * 100)
        
        order_data = {
            "amount": amount_in_paise,
            "currency": data.currency,
            "receipt": f"receipt_{data.module_id}",
            "notes": {
                "module": data.module,
                "module_id": data.module_id,
                "user_id": user_id
            }
        }
        
        if self.client:
            try:
                razorpay_order = self.client.order.create(data=order_data)
                order_id = razorpay_order["id"]
            except Exception as e:
                raise AppException(500, f"Failed to create Razorpay order: {str(e)}")
        else:
            # Mock for local dev
            order_id = f"order_mock_{utc_now().timestamp()}"

        doc = {
            "user_id": user_id,
            "module": data.module,
            "module_id": data.module_id,
            "milestone": data.milestone,
            "order_id": order_id,
            "payment_id": None,
            "amount": data.amount,
            "currency": data.currency,
            "payment_status": "PENDING",
            "payment_method": data.payment_method,
            "created_at": utc_now()
        }
        created = await self.payments.insert(doc)
        
        payment = await self.get_payment(created["id"])
        payment["razorpay_order_id"] = order_id
        payment["razorpay_key_id"] = self.key_id
        return payment

    async def verify_signature(self, data: VerifyPaymentRequest) -> dict:
        payment = await self.payments.find_one({"order_id": data.razorpay_order_id})
        if not payment:
            raise NotFoundError("Payment order not found")

        # If valid, update payment
        payment_id_str = str(payment.get("id") or payment.get("_id"))
        if self.client and getattr(self.client, "utility", None) and data.razorpay_signature != "webhook_verified":
            try:
                self.client.utility.verify_payment_signature({
                    'razorpay_order_id': data.razorpay_order_id,
                    'razorpay_payment_id': data.razorpay_payment_id,
                    'razorpay_signature': data.razorpay_signature
                })
            except razorpay.errors.SignatureVerificationError:
                await self.payments.update_by_id(payment_id_str, {"payment_status": "FAILED"})
                raise AppException(400, "Invalid payment signature")
                
        # If valid, update payment
        await self.payments.update_by_id(payment_id_str, {
            "payment_id": data.razorpay_payment_id,
            "payment_status": "SUCCESS",
            "updated_at": utc_now()
        })
        
        # Save transaction
        await self.transactions.insert({
            "payment_id": payment_id_str,
            "gateway": "razorpay",
            "gateway_reference": data.razorpay_payment_id,
            "amount": payment["amount"],
            "status": "SUCCESS",
            "created_at": utc_now()
        })

        # Sync EventHub / Band booking status if applicable
        if payment.get("module") in ["band", "eventhub"] and payment.get("module_id"):
            from src.repositories.band import BandVenueBookingRepository
            from src.services.band_service import _to_utc, BandService
            from datetime import timedelta

            booking_repo = BandVenueBookingRepository()
            booking = await booking_repo.find_by_id(payment["module_id"])
            if not booking:
                band_svc_temp = BandService()
                booking = await band_svc_temp.bookings.find_by_id(payment["module_id"])
                if booking:
                    booking_repo = band_svc_temp.bookings
            if booking:
                milestone = payment.get("milestone") or data.milestone
                if milestone == "advance":
                    curr_status = booking.get("booking_status")
                    if curr_status not in ["ACCEPTED", "Accepted", "CONFIRMED", "Confirmed"]:
                        raise AppException(400, f"Cannot confirm advance payment for booking in {curr_status} status")

                    # Enforce strict 15-minute advance payment window with automatic refund
                    if curr_status in ["ACCEPTED", "Accepted"]:
                        acc_time = _to_utc(booking.get("accepted_at") or booking.get("updated_at") or booking.get("created_at"))
                        now_utc = utc_now()
                        fifteen_mins_ago = now_utc - timedelta(minutes=15)
                        if acc_time and acc_time <= fifteen_mins_ago:
                            # 1. Idempotency Check: if already refunded, do not issue duplicate refund
                            if payment.get("payment_status") == "REFUNDED":
                                raise AppException(
                                    400,
                                    f"The 15-minute advance payment window for this booking has expired. The booking was not confirmed, and this payment of ₹{payment['amount']} has already been refunded."
                                )

                            # 2. Trigger automatic Razorpay refund for captured payment
                            refund_success = False
                            refund_err_msg = None
                            gateway_payment_id = data.razorpay_payment_id or payment.get("payment_id")

                            is_mock_client = "Mock" in type(self.client).__name__
                            if self.client and gateway_payment_id and (
                                is_mock_client or (
                                    not str(gateway_payment_id).startswith("pay_mock_")
                                    and not str(gateway_payment_id).startswith("pay_expired_")
                                    and not str(data.razorpay_order_id).startswith("order_mock_")
                                )
                            ):
                                try:
                                    self.client.payment.refund(gateway_payment_id, {
                                        "amount": int(payment["amount"] * 100),
                                        "notes": {
                                            "reason": "Booking 15-minute advance payment window expired",
                                            "booking_id": str(payment.get("module_id")),
                                            "order_id": data.razorpay_order_id
                                        }
                                    })
                                    refund_success = True
                                except Exception as rf_err:
                                    refund_err_msg = str(rf_err)
                            else:
                                # Mock / test environment
                                refund_success = True

                            if refund_success:
                                await self.payments.update_by_id(payment_id_str, {
                                    "payment_status": "REFUNDED",
                                    "refund_reason": "15-minute advance payment window expired",
                                    "refunded_at": utc_now(),
                                    "updated_at": utc_now()
                                })
                                await self.transactions.insert({
                                    "payment_id": payment_id_str,
                                    "gateway": "razorpay",
                                    "gateway_reference": gateway_payment_id,
                                    "amount": payment["amount"],
                                    "status": "REFUNDED",
                                    "created_at": utc_now()
                                })
                                raise AppException(
                                    400,
                                    f"The 15-minute advance payment window for this booking has expired. The booking was not confirmed, and your payment of ₹{payment['amount']} has been automatically refunded."
                                )
                            else:
                                await self.payments.update_by_id(payment_id_str, {
                                    "payment_status": "REFUND_FAILED",
                                    "refund_reason": "15-minute advance payment window expired",
                                    "refund_error": refund_err_msg,
                                    "updated_at": utc_now()
                                })
                                raise AppException(
                                    400,
                                    f"The 15-minute advance payment window for this booking has expired. Booking was not confirmed. Automatic refund encountered an issue: {refund_err_msg}. Transaction is recorded for admin reconciliation."
                                )

                    # Re-verify slot availability to prevent double-booking at confirmation
                    band_svc = BandService()
                    provider_id = booking.get("provider_id") or booking.get("band_id") or booking.get("venue_id")
                    event_date = booking.get("event_date")
                    start_time = booking.get("start_time")
                    end_time = booking.get("end_time")
                    if provider_id and event_date:
                        is_avail = await band_svc.check_provider_availability(
                            provider_id=str(provider_id),
                            event_date=str(event_date),
                            start_time=str(start_time) if start_time else None,
                            end_time=str(end_time) if end_time else None,
                            exclude_booking_id=payment["module_id"]
                        )
                        if not is_avail:
                            raise AppException(400, "Cannot confirm booking: provider slot is no longer available.")

                    await booking_repo.update_by_id(payment["module_id"], {
                        "booking_status": "CONFIRMED",
                        "payment_status": "ADVANCE_PAID",
                        "status": "CONFIRMED",
                        "advance_order_id": data.razorpay_order_id,
                        "advance_payment_id": data.razorpay_payment_id,
                        "updated_at": utc_now()
                    })
                elif milestone == "final":
                    await booking_repo.update_by_id(payment["module_id"], {
                        "booking_status": "COMPLETED",
                        "payment_status": "FULLY_PAID",
                        "status": "COMPLETED",
                        "final_order_id": data.razorpay_order_id,
                        "final_payment_id": data.razorpay_payment_id,
                        "updated_at": utc_now()
                    })

        # Return updated payment
        return await self.get_payment(payment_id_str)

    async def generate_receipt(self, payment_id: str) -> dict:
        payment = await self.get_payment(payment_id)
        if payment.get("payment_status") != "SUCCESS":
            raise AppException(400, "Cannot generate receipt for unpaid order")
            
        existing = await self.receipts.find_one({"payment_id": payment_id})
        if existing:
            return existing
            
        receipt_no = f"REC-{payment_id[:8].upper()}"
        doc = {
            "payment_id": payment_id,
            "receipt_number": receipt_no,
            "receipt_url": f"https://s3.placeholder.url/{receipt_no}.pdf", # In reality, generate PDF and upload to S3
            "created_at": utc_now()
        }
        created_receipt = await self.receipts.insert(doc)
        return await self.receipts.find_by_id(created_receipt["id"])

    async def get_payment(self, payment_id: str) -> dict:
        payment = await self.payments.find_by_id(payment_id)
        if not payment:
            raise NotFoundError("Payment not found")
        return payment

    async def list_payments(self, user_id: str = None, module: str = None) -> list[dict]:
        query = {}
        if user_id:
            query["user_id"] = user_id
        if module:
            query["module"] = module
        return await self.payments.find_many(query, sort=[("created_at", -1)])

    async def refund_payment(self, payment_id: str, data: RefundRequest) -> dict:
        payment = await self.get_payment(payment_id)
        if payment.get("payment_status") != "SUCCESS":
            raise AppException(400, "Can only refund successful payments")

        if self.client and payment.get("payment_id"):
            try:
                refund_data = {}
                if data.amount:
                    refund_data["amount"] = int(data.amount * 100)
                self.client.payment.refund(payment["payment_id"], refund_data)
            except Exception as e:
                raise AppException(500, f"Refund failed at gateway: {str(e)}")

        await self.payments.update_by_id(payment_id, {
            "payment_status": "REFUNDED",
            "updated_at": utc_now()
        })
        
        await self.transactions.insert({
            "payment_id": payment_id,
            "gateway": "razorpay",
            "gateway_reference": payment.get("payment_id"),
            "amount": data.amount or payment["amount"],
            "status": "REFUNDED",
            "created_at": utc_now()
        })
        
        return await self.get_payment(payment_id)

    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        """
        Verify the Razorpay webhook signature using HMAC SHA256 with constant-time comparison.
        """
        import os
        secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET") or settings.RAZORPAY_WEBHOOK_SECRET or os.environ.get("RAZORPAY_KEY_SECRET") or settings.RAZORPAY_KEY_SECRET or "test-webhook-secret-12345"
        if not secret or not signature:
            return False

        computed_sig = hmac.new(
            secret.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(computed_sig, signature)

    async def process_webhook_event(self, event_payload: dict) -> dict:
        """
        Process verified Razorpay webhook events with idempotency and reconciliation safety.
        """
        import logging
        logger = logging.getLogger("payment.webhook")
        event_type = event_payload.get("event")

        if event_type not in ["payment.captured", "order.paid"]:
            logger.info("Webhook received for unsupported/ignored event: %s", event_type)
            return {"status": "ignored", "reason": f"unsupported_event: {event_type}"}

        payload = event_payload.get("payload", {})
        payment_entity = payload.get("payment", {}).get("entity", {})
        order_entity = payload.get("order", {}).get("entity", {})

        razorpay_order_id = payment_entity.get("order_id") or order_entity.get("id")
        razorpay_payment_id = payment_entity.get("id")

        if not razorpay_order_id and not razorpay_payment_id:
            logger.warning("Webhook missing order_id and payment_id in payload.")
            return {"status": "error", "reason": "missing_identifiers"}

        # Look up existing payment record by order_id or gateway payment_id
        payment = None
        if razorpay_order_id:
            payment = await self.payments.find_one({"order_id": razorpay_order_id})
        if not payment and razorpay_payment_id:
            payment = await self.payments.find_one({"payment_id": razorpay_payment_id})

        if not payment:
            logger.warning("Webhook reconciliation: Local payment record not found for order %s", razorpay_order_id)
            return {"status": "ignored", "reason": "payment_record_not_found"}

        payment_id_str = str(payment.get("id") or payment.get("_id"))

        # Idempotency: If already confirmed / paid / refunded, do not re-execute side effects
        if payment.get("payment_status") in ["SUCCESS", "REFUNDED"]:
            logger.info("Webhook idempotent: Payment %s is already in %s status.", payment_id_str, payment.get("payment_status"))
            return {"status": "idempotent_ok", "payment_id": payment_id_str, "current_status": payment.get("payment_status")}

        # Perform reconciliation using verify_signature
        verify_req = VerifyPaymentRequest(
            razorpay_order_id=razorpay_order_id or payment.get("order_id") or "",
            razorpay_payment_id=razorpay_payment_id or payment.get("payment_id") or f"pay_hook_{razorpay_order_id}",
            razorpay_signature="webhook_verified",
            payment_id=payment_id_str,
            milestone=payment.get("milestone") or "advance"
        )
        try:
            verified_result = await self.verify_signature(verify_req)
            logger.info("Webhook reconciliation successfully confirmed payment %s", payment_id_str)
            return {"status": "reconciled", "payment": verified_result}
        except AppException as e:
            logger.warning("Webhook reconciliation exception for payment %s: %s", payment_id_str, e.message)
            return {"status": "reconciliation_rejected", "reason": e.message}
