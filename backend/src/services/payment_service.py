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
        if self.client:
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
