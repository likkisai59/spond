---
name: fastapi-standard-development
description: "FastAPI standard development patterns with Pydantic v2 validation, dependency injection, lifespan management, and production-ready project structure"
progressive_disclosure:
  entry_point:
    summary: "FastAPI standard development patterns for production-ready services"
    when_to_use:
      - "When building new FastAPI microservices"
      - "When establishing development standards"
      - "When implementing dependency injection patterns"
      - "When setting up project structure"
    quick_start:
      - "pip install fastapi uvicorn[standard] pydantic pydantic-settings"
      - "Create FastAPI app with lifespan context manager"
      - "Define Pydantic v2 schemas for request/response"
      - "Use dependency injection for DB sessions and auth"
  token_estimate:
    entry: 75-90
    full: 4500-5500
---
# FastAPI Standard Development Skill

## Core Concepts

### Installation
```bash
# Core FastAPI
pip install fastapi==0.115.*
pip install "uvicorn[standard]==0.34.*"

# Pydantic v2 for validation
pip install pydantic==2.11.*
pip install pydantic-settings==2.8.*

# Async support
pip install httpx==0.28.*
```

## Project Structure
```
app/
├── __init__.py
├── main.py                     # FastAPI app, lifespan, middleware
├── config.py                   # Settings via pydantic-settings
├── core/
│   ├── __init__.py
│   ├── auth.py                 # Authentication dependency
│   └── telemetry.py            # OpenTelemetry setup
├── api/
│   ├── __init__.py
│   ├── deps.py                 # Shared dependencies (DB session, httpx)
│   └── v1/
│       ├── __init__.py
│       ├── router.py           # Aggregated v1 router
│       ├── orders.py           # Order endpoints
│       └── webhooks.py         # Webhook endpoints
├── models/
│   └── order.py                # SQLAlchemy models
├── schemas/
│   ├── order.py                # Pydantic request/response schemas
│   └── common.py               # Shared schemas (pagination, errors)
├── services/
│   └── order_service.py        # Business logic layer
└── utils/
    └── exceptions.py           # Custom exceptions
```

## Application Factory with Lifespan

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.config import settings
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle - startup and shutdown."""
    # Startup
    await init_db()
    await init_cache()
    
    yield
    
    # Shutdown
    await close_db()
    await close_cache()

def create_app() -> FastAPI:
    """Application factory pattern."""
    app = FastAPI(
        title="Payments Service",
        description="Payment processing microservice",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )
    
    # Include routers
    app.include_router(api_router, prefix="/api/v1")
    
    return app

app = create_app()
```

## Pydantic v2 Schemas

### Request/Response Schemas
```python
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class OrderType(str, Enum):
    EXAM_ENROLLMENT = "exam_enrollment"
    BUNDLE_PURCHASE = "bundle_purchase"

class OrderBase(BaseModel):
    """Base order schema with shared fields."""
    user_id: str = Field(..., min_length=1, max_length=64)
    item_id: str = Field(..., min_length=1, max_length=64)
    order_type: OrderType
    item_name: str = Field(..., min_length=1, max_length=255)
    item_category: str = Field(..., min_length=1, max_length=100)

class OrderCreate(OrderBase):
    """Schema for creating an order."""
    amount: int = Field(..., gt=0, description="Amount in paise")
    callback_url: Optional[str] = Field(None, max_length=500)
    meta_data: Optional[dict] = None
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        if v > 10000000:  # Max ₹1,00,000
            raise ValueError('Amount exceeds maximum allowed')
        return v

class OrderResponse(OrderBase):
    """Schema for order response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    status: str
    amount: int
    currency: str = "INR"
    razorpay_payment_link_id: Optional[str] = None
    razorpay_payment_link_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    total: int
    page: int
    page_size: int
    items: list
```

## Dependency Injection

### Database Session Dependency
```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Async database session dependency."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Usage in route
@router.post("/orders")
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    ...
```

### HTTP Client Dependency
```python
import httpx
from typing import AsyncGenerator

async def get_http_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Shared HTTP client dependency with connection pooling."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        yield client

# Usage
@router.post("/orders")
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    http_client: httpx.AsyncClient = Depends(get_http_client)
):
    ...
```

### Authentication Dependency
```python
from fastapi import Depends, HTTPException, status, Request
from typing import Optional

async def get_current_user(request: Request) -> dict:
    """Extract and validate current user from request state."""
    user = getattr(request.state, "user_details", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return user

# Usage
@router.get("/users/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
```

## Route Patterns

### CRUD Endpoints
```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new order."""
    order = await order_service.create(db, body, current_user["user_id"])
    return order

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get order by ID."""
    order = await order_service.get(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/", response_model=PaginatedResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List orders with pagination."""
    return await order_service.list(db, page, page_size, status)
```

## Configuration with Pydantic Settings

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # Application
    app_env: str = "development"
    app_port: int = 8000
    app_log_level: str = "INFO"
    
    # Database
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "payments"
    postgres_user: str = "postgres"
    postgres_password: str = ""
    
    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    # JWT
    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"

settings = Settings()
```

## Best Practices

1. **Use Lifespan Context Manager**: For startup/shutdown logic
2. **Pydantic v2 ConfigDict**: Use `model_config = ConfigDict(from_attributes=True)`
3. **Dependency Injection**: For DB sessions, HTTP clients, auth
4. **Generic Paginated Responses**: For list endpoints
5. **Application Factory Pattern**: For testing flexibility
6. **Router Organization**: Group related endpoints
7. **Schema Separation**: Separate Create/Update/Response schemas
8. **Field Validation**: Use Pydantic validators for business rules
9. **API Versioning**: Use router prefix `/api/v1`
10. **Environment Configuration**: Use pydantic-settings

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic v2 Documentation](https://docs.pydantic.dev/latest/)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)

## Related Skills

- **opentelemetry-fastapi-logging**: Observability patterns
- **error-handling-fallback**: Error handling in FastAPI
- **api-versioning-standards**: API versioning approaches
- **unit-testing**: Testing FastAPI applications