---
name: api-versioning-standards
description: "API versioning standards and approaches for RESTful services with URL path, header, and query parameter strategies"
progressive_disclosure:
  entry_point:
    summary: "API versioning strategies and standards for REST services"
    when_to_use:
      - "When designing API versioning strategy"
      - "When planning backward compatibility"
      - "When managing API deprecation"
    quick_start:
      - "Choose versioning approach (URL path recommended)"
      - "Create versioned routers"
      - "Document breaking vs non-breaking changes"
  token_estimate:
    entry: 60-75
    full: 2500-3500
---
# API Versioning Standards Skill

## Versioning Approaches

### URL Path Versioning (Recommended)
```
/api/v1/orders
/api/v2/orders
```

```python
from fastapi import APIRouter

v1_router = APIRouter(prefix="/api/v1")
v2_router = APIRouter(prefix="/api/v2")
```

### Header Versioning
```
Accept: application/vnd.api+json;version=1
```

### Query Parameter
```
/api/orders?version=1
```

## FastAPI Implementation
```python
# app/api/v1/router.py
v1_router = APIRouter()
v1_router.include_router(orders_router)
v1_router.include_router(webhooks_router)

# app/api/v2/router.py
v2_router = APIRouter()
v2_router.include_router(orders_router_v2)

# app/main.py
app.include_router(v1_router)
app.include_router(v2_router)
```

## Versioning Rules
- **Major version (v1 → v2)**: Breaking changes
- **Non-breaking**: Add optional fields, new endpoints
- **Deprecation**: Support old version for 6+ months

## Best Practices
1. Use URL path versioning for clarity
2. Maintain all versions until deprecation
3. Document version differences
4. Include version in error responses
5. Plan migration path for users