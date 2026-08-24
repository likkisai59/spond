---
name: async-non-blocking-service
description: "Asynchronous non-blocking service development patterns for FastAPI with zero blocking I/O"
progressive_disclosure:
  entry_point:
    summary: "Async patterns for building high-performance non-blocking services"
    when_to_use:
      - "When building async FastAPI services"
      - "When eliminating blocking I/O"
      - "When optimizing for concurrency"
    quick_start:
      - "Replace sync libraries with async equivalents"
      - "Use httpx instead of requests"
      - "Use motor instead of pymongo"
  token_estimate:
    entry: 60-75
    full: 3000-4000
---
# Async Non-Blocking Service Skill

## Library Mappings (Sync → Async)
| Operation | Sync (DON'T USE) | Async (USE) |
|-----------|------------------|-------------|
| PostgreSQL | psycopg2 | asyncpg via SQLAlchemy async |
| MongoDB | pymongo | motor |
| HTTP Client | requests | httpx.AsyncClient |
| AWS Services | boto3 | aioboto3 |
| Redis | redis-py | redis-py with aioredis |

## Async Patterns
```python
# Database Session
async with AsyncSessionLocal() as session:
    result = await session.execute(select(Order))
    orders = result.scalars().all()

# HTTP Client
async with httpx.AsyncClient(timeout=10.0) as client:
    response = await client.post(url, json=payload)

# Fire-and-Forget
asyncio.create_task(send_email_safe(order))
```

## Connection Pooling
```python
# PostgreSQL
engine = create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10)

# HTTPX - share client instance
async def get_http_client():
    async with httpx.AsyncClient() as client:
        yield client
```

## Background Jobs
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
scheduler.add_job(sync_expired, "interval", minutes=5)
scheduler.start()
```

## Best Practices
1. Zero blocking calls in request path
2. Use shared HTTP client for connection pooling
3. Use AsyncIOScheduler for background jobs
4. Configure connection pools appropriately
5. Use asyncio.create_task for fire-and-forget