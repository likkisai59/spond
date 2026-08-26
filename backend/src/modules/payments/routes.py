from fastapi import APIRouter, Depends, Request, BackgroundTasks
async def get_current_user():
    return {"id": "dev-sports-user", "name": "Santhosh", "role": "admin", "email": "santhosh@gmail.com"}
from src.services.payment_service import PaymentService
from src.services.notification_service import send_notification_task
from src.schemas.payments import CreateOrderRequest, VerifyPaymentRequest, RefundRequest

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
async def get_payment(id: str, _: dict = Depends(get_current_user)) -> dict:
    payment = await service.get_payment(id)
    return {"status": "success", "data": payment}

@router.post("/refund")
async def refund_payment(id: str, data: RefundRequest, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)) -> dict:
    # Requires strict role checking (Admin usually), omitting for brevity or handle in service
    payment = await service.refund_payment(id, data)
    return {"status": "success", "data": payment}

@router.get("/receipt/{id}")
async def get_receipt(id: str, _: dict = Depends(get_current_user)) -> dict:
    receipt = await service.generate_receipt(id)
    return {"status": "success", "data": receipt}

@router.post("/webhook")
async def razorpay_webhook(request: Request, background_tasks: BackgroundTasks) -> dict:
    # In reality, verify webhook signature
    payload = await request.json()
    # Process event
    return {"status": "success"}
