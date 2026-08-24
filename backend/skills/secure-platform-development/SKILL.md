---
name: secure-platform-development
description: "Secure platform development coding standards for building production-ready, secure services"
progressive_disclosure:
  entry_point:
    summary: "Security coding standards for platform development"
    when_to_use:
      - "When implementing security measures"
      - "When handling sensitive data"
      - "When preventing security vulnerabilities"
    quick_start:
      - "Never log secrets or sensitive data"
      - "Validate all inputs"
      - "Use environment variables for secrets"
  token_estimate:
    entry: 60-75
    full: 2500-3500
---
# Secure Platform Development Skill

## Input Validation
```python
from pydantic import Field, field_validator

class OrderCreate(BaseModel):
    amount: int = Field(..., gt=0, le=10000000)  # Min 1 paise, max ₹1,00,000
    user_id: str = Field(..., min_length=1, max_length=64, pattern=r"^[a-f0-9]+$")
    
    @field_validator('user_id')
    @classmethod
    def validate_user_id(cls, v):
        if not v.isalnum():
            raise ValueError('Invalid user_id format')
        return v
```

## Secret Management
```python
# NEVER hardcode secrets
# BAD: API_KEY = "sk_live_abc123"

# GOOD: Use environment variables
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    jwt_secret_key: str  # Required from env
    razorpay_key_secret: str

settings = Settings()

# NEVER log secrets
# BAD: logger.info(f"Token: {token}")
# GOOD: logger.info(f"Token: ...{token[-4:]}")
```

## Webhook Security
```python
import hmac
import hashlib

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

# Always verify before processing
if not verify_webhook_signature(body, signature, WEBHOOK_SECRET):
    raise HTTPException(status_code=400, detail="Invalid signature")
```

## Best Practices
1. Never log secrets or sensitive data
2. Validate all inputs with Pydantic
3. Use environment variables for secrets
4. Verify webhook signatures
5. Use HTTPS for all external calls
6. Never use `eval()` on user input
7. Use parameterized queries (SQLAlchemy handles this)
8. Set appropriate CORS policies
9. Rate limit API endpoints
10. Keep dependencies updated