"""User document model + construction helpers."""
from datetime import datetime, timezone

from src.constants.roles import MEMBER


def new_user_document(
    *,
    full_name: str,
    email: str,
    password_hash: str,
    phone: str | None = None,
    role: str = MEMBER,
    accessible_modules: list[str] | None = None,
) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "full_name": full_name.strip(),
        "email": email.strip().lower(),
        "phone": phone,
        "password_hash": password_hash,
        "profile_image": None,
        "role": role,
        "accessible_modules": accessible_modules or ["sports", "band"],
        "is_active": True,
        "is_verified": True,  # email verification service lands in a later phase
        "created_at": now,
        "updated_at": now,
        "created_by": None,
        "updated_by": None,
        "is_deleted": False,
    }


def public_user(document: dict) -> dict:
    """Strip sensitive fields for API responses."""
    return {
        "id": document["id"],
        "full_name": document["full_name"],
        "email": document["email"],
        "phone": document.get("phone"),
        "profile_image": document.get("profile_image"),
        "role": document["role"],
        "accessible_modules": document.get("accessible_modules", []),
        "is_active": document.get("is_active", True),
        "is_verified": document.get("is_verified", False),
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }
