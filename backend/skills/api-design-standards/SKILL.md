---
name: api-design-standards
description: "RESTful API design standards with naming conventions, resource modeling, and best practices"
progressive_disclosure:
  entry_point:
    summary: "API design standards for RESTful services"
    when_to_use:
      - "When designing new API endpoints"
      - "When establishing API conventions"
      - "When modeling resources"
    quick_start:
      - "Use nouns for resources, verbs via HTTP methods"
      - "Use plural nouns for collections"
      - "Return consistent response formats"
  token_estimate:
    entry: 60-75
    full: 2500-3500
---
# API Design Standards Skill

## Resource Naming Conventions
```
# Good - nouns, plural for collections
GET /api/v1/orders
GET /api/v1/orders/{order_id}
GET /api/v1/users/{user_id}/orders

# Bad - verbs in URLs
GET /api/v1/getOrders
POST /api/v1/createOrder
```

## HTTP Methods
| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Retrieve resource | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | No |
| DELETE | Remove resource | Yes |

## Response Format
```json
{
    "data": {...},
    "meta": {"total": 100, "page": 1}
}

// Error response
{
    "error": {
        "code": "ORDER_NOT_FOUND",
        "message": "Order not found",
        "request_id": "uuid"
    }
}
```

## Pagination
```
GET /api/v1/orders?page=1&page_size=20

Response:
{
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20
}
```

## Best Practices
1. Use plural nouns for collections
2. Nest sub-resources logically
3. Return consistent error format
4. Support filtering, sorting, pagination
5. Use HTTP status codes correctly
6. Version all endpoints