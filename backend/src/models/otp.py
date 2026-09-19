"""OTP document model + construction helpers."""
from datetime import datetime, timedelta, timezone


def new_otp_document(
    *,
    email: str,
    otp_hash: str,
    purpose: str,
    expires_minutes: int = 5,
) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "email": email.strip().lower(),
        "otp_hash": otp_hash,
        "purpose": purpose,
        "attempts": 0,
        "verified": False,
        "expires_at": now + timedelta(minutes=expires_minutes),
        "created_at": now,
        "updated_at": now,
    }
