---
name: fastapi-background-tasks
description: "FastAPI BackgroundTasks for post-response operations like email notifications, audit logging, and fire-and-forget tasks"
progressive_disclosure:
  entry_point:
    summary: "Run tasks after HTTP response is sent using FastAPI BackgroundTasks"
    when_to_use:
      - "When sending emails after user actions"
      - "When writing to audit trails after requests"
      - "When processing data that does not need immediate confirmation"
      - "For any fire-and-forget operation after a request"
    quick_start:
      - "Inject BackgroundTasks parameter into your endpoint"
      - "Use background_tasks.add_task(function, args) to schedule tasks"
      - "Task functions can be async def or regular def"
      - "Tasks run AFTER the response is returned to the client"
  token_estimate:
    entry: 60-75
    full: 2500-3000
---
# FastAPI Background Tasks Skill

## Basic Usage
```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()

def send_email(recipient: str, message: str):
    """Background task - runs after response is sent."""
    email_service.send(recipient, message)

@app.post("/notify/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email, email, message="Hello!")
    return {"message": "Notification queued"}
```

## Key Concepts

### Task Functions
- Can be `async def` or regular `def` - FastAPI handles both
- Run AFTER the response is returned to the client
- Receive parameters passed via `add_task()`

### Adding Tasks
```python
background_tasks.add_task(
    task_function,       # The function to run
    arg1, arg2,          # Positional arguments
    keyword_arg=value    # Keyword arguments
)
```

## Best Practices

### 1. Keep Tasks Simple
```python
# Good - single responsibility
def send_email(recipient: str, template: str, data: dict):
    email_service.send(recipient, template, data)
```

### 2. Handle Errors Gracefully
```python
async def safe_send_email(recipient: str, order_id: str):
    try:
        await email_service.send(recipient, order_id)
    except Exception as e:
        logger.error(f"Failed to send email: {e}", extra={"order_id": order_id})
```

### 3. Do Not Block in Tasks
```python
# BAD - synchronous HTTP call blocks the event loop
def send_webhook(url: str, data: dict):
    requests.post(url, json=data)  # Blocks!

# GOOD - use async HTTP client
async def send_webhook(url: str, data: dict):
    async with httpx.AsyncClient() as client:
        await client.post(url, json=data)
```

### 4. Pass Data, Not Objects
```python
# BAD - passing complex objects that may have state issues
background_tasks.add_task(process_order, order_object)

# GOOD - pass identifiers and fetch fresh data
background_tasks.add_task(process_order, order_id=str(order.id))
```

## Comparison with Alternatives

| Feature | BackgroundTasks | Celery | APScheduler |
|---------|----------------|--------|-------------|
| Setup complexity | None | High | Medium |
| External dependencies | None | Redis/RabbitMQ | Database |
| Distributed | No | Yes | No |
| Scheduled jobs | No | Yes | Yes |
| Task persistence | No | Yes | Varies |
| Best for | Simple post-request tasks | Heavy workloads | Scheduled jobs |

## BackgroundTasks vs asyncio.create_task()

```python
# asyncio.create_task - runs IMMEDIATELY (may delay response)
asyncio.create_task(send_email(order))

# BackgroundTasks.add_task - runs AFTER response is sent
background_tasks.add_task(send_email, order_id=str(order.id))
```

## Technical Details

- `BackgroundTasks` comes from `starlette.background`
- Tasks run in the same process (share memory/variables)
- If the server crashes, pending tasks are lost
- For critical tasks, use a message queue (Celery) instead

## References

- [FastAPI Background Tasks Documentation](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Starlette Background Tasks](https://www.starlette.dev/background/)
