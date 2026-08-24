---
name: error-handling-fallback
description: "Error handling and fallback mechanisms for FastAPI with custom exceptions, global handlers, and graceful degradation"
progressive_disclosure:
  entry_point:
    summary: "Error handling and fallback mechanisms for production services"
    when_to_use:
      - "When implementing custom exceptions"
      - "When adding global error handlers"
      - "When designing graceful degradation"
    quick_start:
      - "Create custom exception classes"
      - "Add global exception handlers"
      - "Implement fallback logic for external services"
  token_estimate:
    entry: 60-75
    full: 3000-4000
---
# Error Handling and Fallback Skill

## Custom Exception Hierarchy
```python
class PaymentServiceError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 500):
        self.code = code
        self.message = message
        self.status_code = status_code

class OrderNotFoundError(PaymentServiceError):
    def __init__(self, order_id: str):
        super().__init__("ORDER_NOT_FOUND", f"Order {order_id} not found", 404)

class RazorpayAPIError(PaymentServiceError):
    def __init__(self, detail: str):
        super().__init__("RAZORPAY_API_ERROR", detail, 502)
```

## Global Exception Handler
```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(PaymentServiceError)
async def payment_error_handler(request: Request, exc: PaymentServiceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "request_id": getattr(request.state, "request_id", None)
            }
        }
    )
```

## Fallback Patterns
```python
async def call_razorpay_with_fallback(payload: dict, max_retries: int = 2):
    for attempt in range(max_retries):
        try:
            return await razorpay_client.post("/payment_links", json=payload)
        except httpx.TimeoutException:
            if attempt == max_retries - 1:
                raise RazorpayAPIError("Service unavailable")
            await asyncio.sleep(2 ** attempt)
```

## Status Codes
- 400: Bad Request, 401: Unauthorized, 403: Forbidden, 404: Not Found
- 409: Conflict, 422: Validation Error, 500: Internal Error
- 502: Bad Gateway (external API), 503: Service Unavailable

## Best Practices
1. Use custom exception hierarchy
2. Include request_id in error responses
3. Implement retry with exponential backoff
4. Log errors with full context
5. Never expose internal details in production errors