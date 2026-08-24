---
name: async-mongodb-client
description: "Asynchronous MongoDB client patterns for FastAPI using PyMongo AsyncMongoClient with connection pooling, CRUD operations, and FastAPI integration"
progressive_disclosure:
  entry_point:
    summary: "Async MongoDB patterns using PyMongo AsyncMongoClient for non-blocking database operations"
    when_to_use:
      - "When building async FastAPI services with MongoDB"
      - "When migrating from synchronous PyMongo to async"
      - "When needing non-blocking MongoDB operations"
      - "When replacing Motor with native PyMongo async"
    quick_start:
      - "pip install pymongo>=4.3 (includes async support)"
      - "Use AsyncMongoClient instead of MongoClient"
      - "Await all database operations"
      - "Use async context managers for transactions"
  token_estimate:
    entry: 70-85
    full: 4500-5500
---
# Async MongoDB Client Skill

## Overview

PyMongo 4.3+ includes native async support via `AsyncMongoClient`, providing a modern alternative to Motor for asynchronous MongoDB operations. This skill covers async patterns, CRUD operations, transactions, and FastAPI integration.

## Installation

```bash
# PyMongo with async support (4.3+)
pip install "pymongo>=4.3"

# For DNS seedlist connection strings (SRV records)
pip install "pymongo[srv]>=4.3"
```

## Core Concepts

### Sync vs Async Comparison

| Sync (DON'T USE in async apps) | Async (USE) |
|-------------------------------|-------------|
| `MongoClient` | `AsyncMongoClient` |
| `db.collection.find()` | `await collection.find().to_list()` |
| `db.collection.insert_one()` | `await collection.insert_one()` |
| `collection.count_documents()` | `await collection.count_documents()` |

### Key Differences from Motor

- `AsyncMongoClient` is part of PyMongo core (no separate package)
- Same API as synchronous PyMongo with `await` prefix
- Native Python async/await support (no Greenlet dependency)
- Better type hints support
- Uses the same connection pooling and BSON handling

## Connection Setup

### Basic Connection

```python
from pymongo import AsyncMongoClient
from pymongo.server_api import ServerApi

# Basic connection
client = AsyncMongoClient("mongodb://localhost:27017")

# Connection with authentication
client = AsyncMongoClient(
    "mongodb://username:password@localhost:27017",
    maxPoolSize=10,
    minPoolSize=2
)

# MongoDB Atlas connection (SRV record)
client = AsyncMongoClient(
    "mongodb+srv://username:password@cluster.mongodb.net",
    server_api=ServerApi(version="1", strict=True, deprecation_errors=True)
)

# Get database and collection references
db = client["my_database"]
users_collection = db["users"]
```

### Connection Pool Configuration

```python
from pymongo import AsyncMongoClient

client = AsyncMongoClient(
    "mongodb://localhost:27017",
    # Connection pool settings
    maxPoolSize=100,          # Maximum connections in pool
    minPoolSize=10,           # Minimum connections to maintain
    maxIdleTimeMS=60000,      # Close idle connections after 60s
    waitQueueTimeoutMS=5000,  # Timeout waiting for connection
    # Timeout settings
    connectTimeoutMS=5000,
    serverSelectionTimeoutMS=5000,
    socketTimeoutMS=0,        # No socket timeout (indefinite wait)
    # Server monitoring
    heartbeatFrequencyMS=10000,
    # Retry settings
    retryWrites=True,
    retryReads=True,
)
```

### FastAPI Lifespan Integration

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pymongo import AsyncMongoClient

# Global client
mongodb_client: AsyncMongoClient = None

def get_database():
    """Get database instance."""
    return mongodb_client["my_database"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global mongodb_client
    
    # Startup: Initialize MongoDB connection
    mongodb_client = AsyncMongoClient(
        "mongodb://localhost:27017",
        maxPoolSize=20,
        minPoolSize=5
    )
    
    # Verify connection
    await mongodb_client.admin.command("ping")
    print("MongoDB connected successfully")
    
    yield  # Application runs here
    
    # Shutdown: Close MongoDB connection
    if mongodb_client:
        mongodb_client.close()
        print("MongoDB connection closed")

app = FastAPI(lifespan=lifespan)
```

### Dependency Injection Pattern

```python
from typing import AsyncGenerator
from fastapi import Depends
from pymongo import AsyncMongoClient, AsyncCursor
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.asynchronous.collection import AsyncCollection

async def get_mongo_client() -> AsyncMongoClient:
    """Get MongoDB client - use with app state."""
    return mongodb_client

async def get_db(client: AsyncMongoClient = Depends(get_mongo_client)) -> AsyncDatabase:
    """Get database instance."""
    return client["my_database"]

async def get_users_collection(db: AsyncDatabase = Depends(get_db)) -> AsyncCollection:
    """Get users collection."""
    return db["users"]

# Usage in endpoint
@app.get("/users/{user_id}")
async def get_user(
    user_id: str,
    users: AsyncCollection = Depends(get_users_collection)
):
    user = await users.find_one({"_id": user_id})
    return user
```

## CRUD Operations

### Create Operations

```python
from pymongo import AsyncMongoClient
from bson import ObjectId
from datetime import datetime

async def create_user(collection, user_data: dict) -> str:
    """Insert a single document."""
    # Add timestamps
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()
    
    result = await collection.insert_one(user_data)
    return str(result.inserted_id)

async def create_many_users(collection, users_data: list[dict]) -> list[str]:
    """Insert multiple documents."""
    now = datetime.utcnow()
    for user in users_data:
        user["created_at"] = now
        user["updated_at"] = now
    
    result = await collection.insert_many(users_data)
    return [str(id) for id in result.inserted_ids]

# Usage
user_id = await create_user(users_collection, {
    "email": "user@example.com",
    "name": "John Doe",
    "is_active": True
})
```

### Read Operations

```python
from typing import Optional, List, Any
from pymongo import AsyncMongoClient

async def find_user_by_id(collection, user_id: str) -> Optional[dict]:
    """Find a single document by ID."""
    return await collection.find_one({"_id": ObjectId(user_id)})

async def find_user_by_email(collection, email: str) -> Optional[dict]:
    """Find a single document by email."""
    return await collection.find_one({"email": email})

async def find_active_users(
    collection,
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    """Find multiple documents with pagination."""
    cursor = collection.find({"is_active": True}).skip(skip).limit(limit)
    return await cursor.to_list(length=limit)

async def find_users_with_projection(collection) -> dict:
    """Find with field projection (exclude sensitive fields)."""
    return await collection.find_one(
        {"email": "user@example.com"},
        {"projection": {"password": 0, "secret_field": 0}}  # Exclude fields
    )

async def count_active_users(collection) -> int:
    """Count documents matching filter."""
    return await collection.count_documents({"is_active": True})

async def distinct_user_emails(collection) -> List[str]:
    """Get distinct values for a field."""
    return await collection.distinct("email", {"is_active": True})
```

### Update Operations

```python
from pymongo import ASCENDING, DESCENDING
from datetime import datetime

async def update_user(collection, user_id: str, updates: dict) -> bool:
    """Update a single document."""
    updates["updated_at"] = datetime.utcnow()
    
    result = await collection.update_one(
        {"_id": ObjectId(user_id)},
    {"$set": updates}
    )
    return result.modified_count > 0

async def upsert_user_by_email(collection, email: str, user_data: dict) -> str:
    """Update or insert document."""
    user_data["updated_at"] = datetime.utcnow()
    
    result = await collection.update_one(
        {"email": email},
        {"$set": user_data},
        upsert=True
    )
    
    if result.upserted_id:
        return str(result.upserted_id)
    return str(result.matched_count)

async def increment_login_count(collection, user_id: str) -> bool:
    """Increment a numeric field."""
    result = await collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"login_count": 1}, "$set": {"last_login": datetime.utcnow()}}
    )
    return result.modified_count > 0

async def add_to_array(collection, user_id: str, role: str) -> bool:
    """Add element to array (no duplicates)."""
    result = await collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"roles": role}}
    )
    return result.modified_count > 0

async def bulk_update_status(collection, user_ids: list[str], status: str) -> int:
    """Update multiple documents."""
    result = await collection.update_many(
        {"_id": {"$in": [ObjectId(id) for id in user_ids]}},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count
```

### Delete Operations

```python
async def delete_user(collection, user_id: str) -> bool:
    """Delete a single document."""
    result = await collection.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0

async def delete_inactive_users(collection) -> int:
    """Delete multiple documents."""
    result = await collection.delete_many({"is_active": False})
    return result.deleted_count

async def soft_delete_user(collection, user_id: str) -> bool:
    """Soft delete (mark as deleted instead of removing)."""
    result = await collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"deleted_at": datetime.utcnow(), "is_active": False}}
    )
    return result.modified_count > 0
```

## Query Patterns

### Filtering and Sorting

```python
from pymongo import ASCENDING, DESCENDING
from bson import Regex

async def search_users(
    collection,
    search_term: str,
    skip: int = 0,
    limit: int = 20
) -> List[dict]:
    """Search users with text search."""
    cursor = collection.find(
        {"$text": {"$search": search_term}},
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).skip(skip).limit(limit)
    
    return await cursor.to_list(length=limit)

async def get_users_by_date_range(
    collection,
    start_date: datetime,
    end_date: datetime
) -> List[dict]:
    """Query by date range."""
    cursor = collection.find({
        "created_at": {
            "$gte": start_date,
            "$lte": end_date
        }
    }).sort("created_at", DESCENDING)
    
    return await cursor.to_list(length=100)

async def complex_filter_query(collection) -> List[dict]:
    """Complex filter with AND/OR logic."""
    cursor = collection.find({
        "$and": [
            {"is_active": True},
            {
                "$or": [
                    {"role": "admin"},
                    {"role": "moderator"}
                ]
            },
            {"email": {"$regex": r"^.*@example\.com$", "$options": "i"}}
        ]
    })
    
    return await cursor.to_list(length=100)
```

### Aggregation Pipeline

```python
async def aggregate_user_stats(collection) -> List[dict]:
    """Aggregate statistics using pipeline."""
    pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {
            "_id": "$role",
            "count": {"$sum": 1},
            "avg_login_count": {"$avg": "$login_count"}
        }},
        {"$sort": {"count": -1}},
        {"$project": {
            "role": "$_id",
            "count": 1,
            "avg_login_count": {"$round": ["$avg_login_count", 2]},
            "_id": 0
        }}
    ]
    
    cursor = collection.aggregate(pipeline)
    return await cursor.to_list(length=100)

async def lookup_join_example(collection) -> List[dict]:
    """Join with another collection using $lookup."""
    pipeline = [
        {"$match": {"is_active": True}},
        {"$lookup": {
            "from": "orders",
            "localField": "_id",
            "foreignField": "user_id",
            "as": "orders"
        }},
        {"$addFields": {
            "order_count": {"$size": "$orders"}
        }},
        {"$project": {"orders": 0}}  # Exclude full orders array
    ]
    
    cursor = collection.aggregate(pipeline)
    return await cursor.to_list(length=100)
```

## Transactions

### Multi-Document ACID Transactions

```python
from pymongo import AsyncMongoClient
from pymongo.asynchronous.client_session import AsyncClientSession

async def transfer_credits(
    client: AsyncMongoClient,
    from_user_id: str,
    to_user_id: str,
    amount: int
) -> bool:
    """Transfer credits between users atomically."""
    async with await client.start_session() as session:
        async with session.start_transaction():
            db = client["my_database"]
            users = db["users"]
            
            # Deduct from sender
            result = await users.update_one(
                {"_id": ObjectId(from_user_id), "credits": {"$gte": amount}},
                {"$inc": {"credits": -amount}},
                session=session
            )
            
            if result.matched_count == 0:
                raise ValueError("Insufficient credits or user not found")
            
            # Add to receiver
            result = await users.update_one(
                {"_id": ObjectId(to_user_id)},
                {"$inc": {"credits": amount}},
                session=session
            )
            
            if result.matched_count == 0:
                raise ValueError("Receiver not found")
            
            # Log transaction
            await db["transactions"].insert_one(
                {
                    "from_user": from_user_id,
                    "to_user": to_user_id,
                    "amount": amount,
                    "created_at": datetime.utcnow()
                },
                session=session
            )
            
            # Transaction auto-commits on successful exit
            return True

# With retry logic for transient errors
from pymongo.errors import ConnectionFailure, OperationFailure

async def transaction_with_retry(client: AsyncMongoClient, callback, max_retries: int = 3):
    """Execute transaction with automatic retry."""
    for attempt in range(max_retries):
        try:
            async with await client.start_session() as session:
                async with session.start_transaction():
                    return await callback(session)
        except (ConnectionFailure, OperationFailure) as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(0.5 * (attempt + 1))  # Exponential backoff
```

## Indexes

### Creating and Managing Indexes

```python
from pymongo import ASCENDING, DESCENDING, TEXT
from pymongo.errors import OperationFailure

async def create_user_indexes(collection) -> None:
    """Create recommended indexes for users collection."""
    
    # Unique index on email
    await collection.create_index(
        "email",
        unique=True,
        name="idx_email_unique"
    )
    
    # Compound index for common queries
    await collection.create_index(
        [("is_active", ASCENDING), ("created_at", DESCENDING)],
        name="idx_active_created"
    )
    
    # Text index for search
    await collection.create_index(
        [("name", TEXT), ("email", TEXT)],
        name="idx_text_search"
    )
    
    # TTL index for expiring documents
    await collection.create_index(
        "expires_at",
        expireAfterSeconds=0,
        name="idx_ttl_expires"
    )

async def list_collection_indexes(collection) -> List[dict]:
    """List all indexes on collection."""
    cursor = collection.list_indexes()
    return await cursor.to_list(length=100)

async def drop_index(collection, index_name: str) -> bool:
    """Drop an index by name."""
    try:
        await collection.drop_index(index_name)
        return True
    except OperationFailure:
        return False
```

## Error Handling

### Exception Handling Patterns

```python
from pymongo.errors import (
    DuplicateKeyError,
    ConnectionFailure,
    OperationFailure,
    ServerSelectionTimeoutError,
    AutoReconnect
)
from fastapi import HTTPException, status

async def safe_insert_user(collection, user_data: dict) -> str:
    """Insert user with proper error handling."""
    try:
        result = await collection.insert_one(user_data)
        return str(result.inserted_id)
    
    except DuplicateKeyError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with this email already exists: {e.details}"
        )
    
    except ConnectionFailure:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )
    
    except ServerSelectionTimeoutError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database server selection timeout"
        )
    
    except OperationFailure as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database operation failed: {e.details}"
        )

async def check_database_health(client: AsyncMongoClient) -> dict:
    """Check MongoDB connection health."""
    try:
        result = await client.admin.command("ping")
        return {
            "status": "healthy",
            "connected": True,
            "server_info": result
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "connected": False,
            "error": str(e)
        }
```

## Testing

### Unit Testing with Mock MongoDB

```python
import pytest
from pymongo import AsyncMongoClient
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
async def mock_collection():
    """Create mock collection for testing."""
    collection = AsyncMock()
    return collection

@pytest.mark.asyncio
async def test_find_user_by_email(mock_collection):
    """Test find user by email."""
    # Setup mock
    mock_collection.find_one.return_value = {
        "_id": "507f1f77bcf86cd799439011",
        "email": "test@example.com",
        "name": "Test User"
    }
    
    # Execute
    result = await mock_collection.find_one({"email": "test@example.com"})
    
    # Assert
    assert result is not None
    assert result["email"] == "test@example.com"

# Integration test with real MongoDB (test database)
@pytest.fixture
async def test_client():
    """Create test MongoDB client."""
    client = AsyncMongoClient("mongodb://localhost:27017/test")
    yield client
    # Cleanup
    await client.drop_database("test")
    client.close()

@pytest.mark.asyncio
async def test_integration_create_user(test_client):
    """Integration test for user creation."""
    db = test_client["test"]
    collection = db["users"]
    
    # Create user
    result = await collection.insert_one({
        "email": "integration@test.com",
        "name": "Integration Test"
    })
    
    assert result.inserted_id is not None
    
    # Verify user exists
    user = await collection.find_one({"_id": result.inserted_id})
    assert user["email"] == "integration@test.com"
```

## FastAPI Complete Example

```python
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pymongo import AsyncMongoClient
from pymongo.asynchronous.collection import AsyncCollection
from contextlib import asynccontextmanager

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    role: str = "user"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        populate_by_name = True

# Global client
mongodb_client: AsyncMongoClient = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongodb_client
    mongodb_client = AsyncMongoClient(
        "mongodb://localhost:27017",
        maxPoolSize=20,
        minPoolSize=5
    )
    await mongodb_client.admin.command("ping")
    yield
    if mongodb_client:
        mongodb_client.close()

app = FastAPI(lifespan=lifespan, title="User API")

# Dependencies
async def get_users_collection() -> AsyncCollection:
    return mongodb_client["myapp"]["users"]

# Helper to convert ObjectId to string
def user_helper(user: dict) -> dict:
    user["id"] = str(user.pop("_id"))
    return user

# Routes
@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    collection: AsyncCollection = Depends(get_users_collection)
):
    """Create a new user."""
    # Check if email exists
    existing = await collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump()
    user_dict.update({
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    result = await collection.insert_one(user_dict)
    created_user = await collection.find_one({"_id": result.inserted_id})
    
    return user_helper(created_user)

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    collection: AsyncCollection = Depends(get_users_collection)
):
    """Get user by ID."""
    try:
        user = await collection.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_helper(user)

@app.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    is_active: bool = True,
    collection: AsyncCollection = Depends(get_users_collection)
):
    """List users with pagination."""
    cursor = collection.find({"is_active": is_active}).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    return [user_helper(u) for u in users]

@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    collection: AsyncCollection = Depends(get_users_collection)
):
    """Update user."""
    update_dict = user_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await collection.find_one({"_id": ObjectId(user_id)})
    return user_helper(updated_user)

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    collection: AsyncCollection = Depends(get_users_collection)
):
    """Delete user."""
    result = await collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

@app.get("/health/mongodb")
async def mongodb_health():
    """Check MongoDB health."""
    try:
        await mongodb_client.admin.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"MongoDB unhealthy: {str(e)}"
        )
```

## Best Practices

1. **Use Connection Pooling**: Configure `maxPoolSize` and `minPoolSize` appropriately
2. **Use AsyncMongoClient**: Never use synchronous `MongoClient` in async applications
3. **Handle Errors Gracefully**: Catch specific exceptions (DuplicateKeyError, ConnectionFailure)
4. **Use Indexes**: Create indexes for frequently queried fields
5. **Use Projections**: Exclude unnecessary fields in queries
6. **Use Transactions Sparingly**: Only when ACID guarantees are needed across documents
7. **Implement Retry Logic**: Retry on transient errors (AutoReconnect)
8. **Validate ObjectIds**: Use try/except when converting string to ObjectId
9. **Use TTL Indexes**: For expiring data (sessions, tokens)
10. **Monitor Connection Health**: Implement health check endpoints

## Migration from Motor

If migrating from Motor to native PyMongo async:

```python
# Motor (old)
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient("mongodb://localhost:27017")

# PyMongo Async (new)
from pymongo import AsyncMongoClient
client = AsyncMongoClient("mongodb://localhost:27017")

# The API is nearly identical, just change imports
# Motor uses 'AsyncIOMotorClient', 'AsyncIOMotorDatabase', 'AsyncIOMotorCollection'
# PyMongo async uses 'AsyncMongoClient', 'AsyncDatabase', 'AsyncCollection'
```

## References

- [PyMongo Documentation](https://pymongo.readthedocs.io/)
- [PyMongo Async Migration Guide](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/reference/migration/)
- [MongoDB CRUD Operations](https://www.mongodb.com/docs/manual/crud/)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)

## Related Skills

- **async-non-blocking-service**: General async patterns for FastAPI
- **fastapi-standard-development**: FastAPI best practices
- **error-handling-fallback**: Error handling patterns
- **unit-testing**: Testing patterns for async code