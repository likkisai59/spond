from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CreateOrderRequest(BaseModel):
    module: str = Field(..., description="sports or band")
    module_id: str = Field(..., description="Booking ID or Event ID")
    amount: float = Field(..., gt=0, description="Amount in INR")
    currency: str = Field(default="INR")
    payment_method: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    payment_id: str

class RefundRequest(BaseModel):
    amount: Optional[float] = None # full if not provided
    reason: Optional[str] = None
