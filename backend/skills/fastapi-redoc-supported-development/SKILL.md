---
name: fastapi-redoc-supported-development
description: "FastAPI documentation standards with ReDoc support, OpenAPI schema customization, and comprehensive API documentation"
progressive_disclosure:
  entry_point:
    summary: "Documentation standards for FastAPI with ReDoc support"
    when_to_use:
      - "When documenting FastAPI endpoints"
      - "When customizing OpenAPI schemas"
      - "When setting up ReDoc documentation"
    quick_start:
      - "Configure docs_url and redoc_url in FastAPI"
      - "Add descriptions to all endpoints"
      - "Document request/response schemas"
  token_estimate:
    entry: 60-75
    full: 2500-3500
---
# FastAPI ReDoc Supported Development Skill

## FastAPI Documentation Configuration
```python
app = FastAPI(
    title="Payments Service",
    description="Payment processing microservice",
    version="1.0.0",
    docs_url="/api/docs",          # Swagger UI
    redoc_url="/api/redoc",        # ReDoc
    openapi_url="/api/openapi.json",
    contact={"name": "Team", "email": "team@example.com"},
    license_info={"name": "MIT"},
)
```

## Endpoint Documentation
```python
@router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description="Creates an order and returns Razorpay payment link",
    responses={
        201: {"description": "Order created successfully"},
        400: {"description": "Invalid request body"},
        401: {"description": "Unauthorized"},
        502: {"description": "Payment gateway error"},
    }
)
async def create_order(body: OrderCreate, ...):
    """Create a new payment order.
    
    - **user_id**: MongoDB ObjectId of the user
    - **item_id**: ID of the item being purchased
    - **amount**: Amount in paise (₹299 = 29900)
    """
    ...
```

## Schema Documentation
```python
class OrderCreate(BaseModel):
    """Schema for creating a new order."""
    user_id: str = Field(..., description="MongoDB ObjectId", example="507f1f77bcf86cd799439011")
    amount: int = Field(..., gt=0, description="Amount in paise", example=29900)
```

## Best Practices
1. Document all endpoints with summary and description
2. Define response models for all status codes
3. Use Field descriptions for schema properties
4. Include examples in schema definitions
5. Keep descriptions up-to-date with implementation