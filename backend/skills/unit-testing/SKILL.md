---
name: unit-testing
description: "Unit testing patterns for FastAPI with pytest, pytest-asyncio, and async test clients"
progressive_disclosure:
  entry_point:
    summary: "Unit testing patterns for FastAPI services"
    when_to_use:
      - "When writing tests for FastAPI endpoints"
      - "When testing async code"
      - "When mocking external services"
    quick_start:
      - "pip install pytest pytest-asyncio httpx"
      - "Create conftest.py with fixtures"
      - "Write async test functions"
  token_estimate:
    entry: 60-75
    full: 3000-4000
---
# Unit Testing Skill

## Installation
```bash
pip install pytest==8.3.*
pip install pytest-asyncio==0.25.*
pip install httpx  # For AsyncClient testing
```

## Test Configuration
```python
# pytest.ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

## Fixtures (conftest.py)
```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

@pytest_asyncio.fixture
async def auth_headers():
    token = create_test_jwt(user_id="test123")
    return {"Authorization": f"Bearer {token}"}
```

## Test Patterns
```python
@pytest.mark.asyncio
async def test_create_order(client, auth_headers):
    response = await client.post(
        "/api/v1/orders",
        json={"user_id": "test", "item_id": "item1", "amount": 100},
        headers=auth_headers
    )
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_unauthorized(client):
    response = await client.get("/api/v1/orders")
    assert response.status_code == 401
```

## Best Practices
1. Use pytest-asyncio for async tests
2. Rollback database changes after each test
3. Mock external services (Razorpay, SES)
4. Use descriptive test names
5. Test both success and error cases