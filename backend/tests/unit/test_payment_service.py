"""Unit tests for PaymentService (Razorpay order creation, signature verification, receipts, refunds)."""
from unittest.mock import MagicMock
import pytest
from bson import ObjectId
import razorpay
from src.services.payment_service import PaymentService
from src.exceptions.handlers import AppException, NotFoundError
from src.schemas.payments import CreateOrderRequest, VerifyPaymentRequest, RefundRequest


@pytest.fixture
def mock_razorpay_client(monkeypatch):
    mock_client = MagicMock()
    # Mock order.create
    mock_client.order.create.return_value = {"id": "order_rzp_mock_12345"}
    # Mock signature verification
    mock_client.utility.verify_payment_signature.return_value = True
    # Mock refund
    mock_client.payment.refund.return_value = {"id": "rfnd_rzp_mock_123"}
    return mock_client


@pytest.fixture
def payment_service(mock_razorpay_client):
    service = PaymentService()
    service.client = mock_razorpay_client
    return service


@pytest.mark.asyncio
async def test_create_order(payment_service, mock_razorpay_client):
    user_id = str(ObjectId())
    req = CreateOrderRequest(
        amount=1500.0,
        currency="INR",
        module="sports",
        module_id="slot_123",
        payment_method="UPI",
    )
    payment = await payment_service.create_order(user_id=user_id, data=req)

    # Verify amount in paise passed to Razorpay
    mock_razorpay_client.order.create.assert_called_once_with(
        data={
            "amount": 150000,
            "currency": "INR",
            "receipt": "receipt_slot_123",
            "notes": {
                "module": "sports",
                "module_id": "slot_123",
                "user_id": user_id,
            },
        }
    )
    assert payment["order_id"] == "order_rzp_mock_12345"
    assert payment["payment_status"] == "PENDING"
    assert payment["amount"] == 1500.0


@pytest.mark.asyncio
async def test_verify_signature_success(payment_service, mock_razorpay_client):
    user_id = str(ObjectId())
    order = await payment_service.create_order(
        user_id=user_id,
        data=CreateOrderRequest(
            amount=800.0, currency="INR", module="sports", module_id="mod_1"
        ),
    )

    verify_req = VerifyPaymentRequest(
        payment_id=order["id"],
        razorpay_order_id=order["order_id"],
        razorpay_payment_id="pay_mock_999",
        razorpay_signature="sig_valid_hex_123",
    )
    updated = await payment_service.verify_signature(verify_req)

    assert updated["payment_status"] == "SUCCESS"
    assert updated["payment_id"] == "pay_mock_999"

    # Verify transaction record was saved
    tx = await payment_service.transactions.find_one({"payment_id": order["id"]})
    assert tx is not None
    assert tx["status"] == "SUCCESS"
    assert tx["amount"] == 800.0


@pytest.mark.asyncio
async def test_verify_signature_invalid(payment_service, mock_razorpay_client):
    user_id = str(ObjectId())
    order = await payment_service.create_order(
        user_id=user_id,
        data=CreateOrderRequest(
            amount=500.0, currency="INR", module="sports", module_id="mod_2"
        ),
    )

    # Simulate invalid signature error
    mock_razorpay_client.utility.verify_payment_signature.side_effect = (
        razorpay.errors.SignatureVerificationError("Signature mismatch")
    )

    verify_req = VerifyPaymentRequest(
        payment_id=order["id"],
        razorpay_order_id=order["order_id"],
        razorpay_payment_id="pay_bad_000",
        razorpay_signature="sig_tampered",
    )

    with pytest.raises(AppException) as exc_info:
        await payment_service.verify_signature(verify_req)
    assert exc_info.value.status_code == 400
    assert "Invalid payment signature" in str(exc_info.value.message)

    # Check status changed to FAILED
    payment = await payment_service.get_payment(order["id"])
    assert payment["payment_status"] == "FAILED"


@pytest.mark.asyncio
async def test_verify_signature_order_not_found(payment_service):
    verify_req = VerifyPaymentRequest(
        payment_id=str(ObjectId()),
        razorpay_order_id="order_nonexistent",
        razorpay_payment_id="pay_123",
        razorpay_signature="sig_123",
    )
    with pytest.raises(NotFoundError):
        await payment_service.verify_signature(verify_req)


@pytest.mark.asyncio
async def test_generate_receipt_unpaid_error(payment_service):
    user_id = str(ObjectId())
    order = await payment_service.create_order(
        user_id=user_id,
        data=CreateOrderRequest(
            amount=1000.0, currency="INR", module="sports", module_id="mod_3"
        ),
    )
    with pytest.raises(AppException) as exc_info:
        await payment_service.generate_receipt(order["id"])
    assert exc_info.value.status_code == 400
    assert "unpaid" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_generate_receipt_success_and_idempotence(payment_service):
    user_id = str(ObjectId())
    order = await payment_service.create_order(
        user_id=user_id,
        data=CreateOrderRequest(
            amount=1000.0, currency="INR", module="sports", module_id="mod_4"
        ),
    )
    # Manually mark as SUCCESS
    await payment_service.payments.update_by_id(order["id"], {"payment_status": "SUCCESS"})

    receipt1 = await payment_service.generate_receipt(order["id"])
    assert receipt1["payment_id"] == order["id"]
    assert "receipt_number" in receipt1

    # Second call returns existing receipt (idempotent)
    receipt2 = await payment_service.generate_receipt(order["id"])
    assert receipt2["receipt_number"] == receipt1["receipt_number"]


@pytest.mark.asyncio
async def test_refund_lifecycle(payment_service):
    user_id = str(ObjectId())
    order = await payment_service.create_order(
        user_id=user_id,
        data=CreateOrderRequest(
            amount=2000.0, currency="INR", module="sports", module_id="mod_5"
        ),
    )

    # Attempting refund on PENDING payment fails
    with pytest.raises(AppException) as exc_info:
        await payment_service.refund_payment(order["id"], RefundRequest(amount=2000.0))
    assert exc_info.value.status_code == 400
    assert "only refund successful" in str(exc_info.value.message).lower()

    # Mark as SUCCESS and refund
    await payment_service.payments.update_by_id(
        order["id"], {"payment_status": "SUCCESS", "payment_id": "pay_mock_ref"}
    )
    refunded = await payment_service.refund_payment(
        order["id"], RefundRequest(amount=2000.0, reason="Cancelled booking")
    )
    assert refunded["payment_status"] == "REFUNDED"
