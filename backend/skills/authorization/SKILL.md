---
name: authorization
description: "JWT-based authentication and authorization patterns for FastAPI with token validation, user lookup, and access control"
progressive_disclosure:
  entry_point:
    summary: "JWT authentication and authorization patterns for FastAPI"
    when_to_use:
      - "When implementing user authentication"
      - "When adding JWT token validation"
      - "When securing API endpoints"
    quick_start:
      - "pip install PyJWT"
      - "Create JWT verification helper"
      - "Add auth dependency to routes"
  token_estimate:
    entry: 60-75
    full: 3000-4000
---
# Authorization Skill

## JWT Authentication Pattern

```python
import jwt
from fastapi import HTTPException, Request, status, Depends
from datetime import datetime, timezone

async def check_user_authorization(request: Request):
    """Validate JWT access token, attach user to request.state."""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid access token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch user from database
        user = await fetch_user(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        if not user.get("is_active", True):
            raise HTTPException(status_code=403, detail="Account deactivated")
        
        request.state.user_details = user
        request.state.request_id = str(uuid.uuid4())
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Usage
@router.get("/protected")
async def protected_route(user: dict = Depends(check_user_authorization)):
    return {"user_id": user["user_id"]}
```

## Status Codes
- **401 Unauthorized** - Missing, invalid, or expired token
- **403 Forbidden** - Valid token but insufficient permissions or deactivated account
- **500 Internal Server Error** - Unexpected error during verification

## Best Practices
1. Always verify token type (access vs refresh)
2. Fetch user from database to check current status
3. Check is_active flag for account status
4. Never log or expose token contents
5. Use HTTPS for all authenticated requests