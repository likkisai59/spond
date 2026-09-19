from fastapi import APIRouter, Depends, Request, BackgroundTasks
import json
import logging
from src.dependencies.auth import get_current_user
from src.services.payment_service import PaymentService
from src.services.notification_service import send_notification_task
from src.schemas.payments import CreateOrderRequest, VerifyPaymentRequest, RefundRequest
from src.exceptions.handlers import AppException

logger = logging.getLogger("payments.routes")

router = APIRouter(prefix="/payments", tags=["Payments"])
service = PaymentService()

@router.post("/create-order")
async def create_order(data: CreateOrderRequest, user: dict = Depends(get_current_user)) -> dict:
    payment = await service.create_order(user["id"], data)
    return {"status": "success", "data": payment}

@router.post("/verify")
async def verify_payment(data: VerifyPaymentRequest, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)) -> dict:
    payment = await service.verify_signature(data)
    
    # Trigger background tasks upon success
    background_tasks.add_task(
        send_notification_task,
        user["id"],
        "Payment Successful",
        f"Your payment of {payment['amount']} {payment['currency']} was successful.",
        "PAYMENT_SUCCESS",
        payment["module"]
    )
    
    return {"status": "success", "data": payment}

@router.get("/history")
async def payment_history(module: str = None, user: dict = Depends(get_current_user)) -> dict:
    payments = await service.list_payments(user_id=user["id"], module=module)
    return {"status": "success", "data": {"items": payments}}

@router.get("/{id}")
async def get_payment(id: str, user: dict = Depends(get_current_user)) -> dict:
    payment = await service.get_payment(id)
    return {"status": "success", "data": payment}

@router.post("/refund")
async def refund_payment(id: str, data: RefundRequest, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)) -> dict:
    payment = await service.refund_payment(id, data)
    return {"status": "success", "data": payment}

@router.get("/receipt/{id}")
async def get_receipt(id: str, user: dict = Depends(get_current_user)) -> dict:
    receipt = await service.generate_receipt(id)
    return {"status": "success", "data": receipt}

@router.post("/webhook")
async def razorpay_webhook(request: Request, background_tasks: BackgroundTasks) -> dict:
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature") or request.headers.get("x-razorpay-signature") or ""

    if not signature or not service.verify_webhook_signature(raw_body, signature):
        logger.warning("Rejected Razorpay webhook request: Invalid or missing HMAC signature.")
        raise AppException(400, "Invalid webhook signature")

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as parse_err:
        logger.error("Failed to parse verified webhook payload: %s", parse_err)
        raise AppException(400, "Malformed webhook JSON payload")

    result = await service.process_webhook_event(payload)
    return {"status": "success", "data": result}
