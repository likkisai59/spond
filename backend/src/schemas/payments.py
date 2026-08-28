from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CreateOrderRequest(BaseModel):
    module: str = Field(..., description="sports, band, or eventhub")
    module_id: str = Field(..., description="Booking ID or Event ID")
    amount: float = Field(..., gt=0, description="Amount in INR")
    currency: str = Field(default="INR")
    payment_method: Optional[str] = None
    milestone: Optional[str] = Field(default=None, description="advance (25%) or final (75%)")

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    payment_id: str
    milestone: Optional[str] = None

class RefundRequest(BaseModel):
    amount: Optional[float] = None # full if not provided
    reason: Optional[str] = None
