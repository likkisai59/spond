"""Authentication: register / login / refresh rotation / logout / password flows."""
from src.core import security
from src.core.config import settings
from src.exceptions.handlers import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)
from src.models.user import new_user_document, public_user
from src.constants.roles import ALL_ROLES, MEMBER, effective_modules
from src.models.otp import new_otp_document
from src.repositories import TokenRepository, UserRepository, OtpRepository
from src.services.audit_service import AuditService
from src.services.email_service import EmailService
import asyncio
import os
import secrets
import string



class AuthService:
    def __init__(self) -> None:
        self.users = UserRepository()
        self.tokens = TokenRepository()
        self.otps = OtpRepository()
        self.audit = AuditService()
        self.email_service = EmailService()

    # ---------- helpers ----------
    def _validate_role(self, role: str) -> None:
        if role not in ALL_ROLES:
            raise NotFoundError(f"Unknown role '{role}'")

    def _validate_password(self, password: str) -> None:
        if len(password) < 8 or not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
            raise UnauthorizedError(
                "Password must be at least 8 characters with one letter and one number"
            )

    async def _issue_tokens(self, user: dict) -> dict:
        modules = effective_modules(user["role"], user.get("accessible_modules", []))
        access_token, _ = security.create_access_token(
            user["id"], user["email"], user["role"], modules
        )
        refresh_token, jti, expires_at = security.create_refresh_token(user["id"])
        await self.tokens.store(
            jti=jti,
            user_id=user["id"],
            token_type=security.TOKEN_TYPE_REFRESH,
            expires_at=expires_at,
        )
        return {"user": public_user(user), "access_token": access_token, "refresh_token": refresh_token}

    # ---------- flows ----------
    async def register(
        self,
        *,
        full_name: str,
        email: str,
        password: str,
        phone: str | None,
        accessible_modules: list[str],
        role: str | None = None,
    ) -> dict:
        self._validate_password(password)
        if await self.users.email_exists(email):
            raise ConflictError("An account with this email already exists")
            
        # Allow public registration for standard client/provider/sports roles (prevent admin privilege escalation)
        valid_roles = [MEMBER, "venue_owner", "sports_venue_owner", "client", "artist", "band", "player", "coach"]
        assign_role: str = role if role in valid_roles else MEMBER
        
        document = new_user_document(
            full_name=full_name,
            email=email,
            password_hash=security.hash_password(password),
            phone=phone,
            role=assign_role,
            accessible_modules=accessible_modules,
        )
        created = await self.users.insert(document)
        await self.audit.log(user_id=created["id"], action="register", module="auth")
        return await self._issue_tokens(created)

    async def request_otp(self, *, email: str) -> None:
        # We allow existing users to reset password or login via OTP if we want later,
        # but for now we just verify if they exist if it's for signup.
        # However, to prevent leaking info, we can just send it.
        # But for B2C Signup, we might want to check if email already exists
        # and throw an error to guide them to login.
        if await self.users.email_exists(email):
            raise ConflictError("An account with this email already exists")

        otp = ''.join(secrets.choice(string.digits) for _ in range(6))
        otp_hash = security.hash_password(otp)
        
        doc = new_otp_document(
            email=email,
            otp_hash=otp_hash,
            purpose="signup"
        )
        await self.otps.insert(doc)
        
        # Send email (mock)
        await self.email_service.send_otp_email(to_email=email, otp=otp, purpose="signup")

    async def verify_otp(self, *, email: str, otp: str) -> str:
        # Find the latest OTP for this email and purpose
        # Since we use simple insert without updating previous, we can just find the most recent
        cursor = self.otps.collection.find(
            {"email": email.strip().lower(), "purpose": "signup", "verified": False}
        ).sort("created_at", -1).limit(1)
        
        docs = await cursor.to_list(length=1)
        if not docs:
            raise UnauthorizedError("No active OTP found. Please request a new one.")
            
        doc = docs[0]
        
        from datetime import datetime, timezone
        if doc["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise UnauthorizedError("OTP has expired. Please request a new code")
            
        if doc.get("attempts", 0) >= 3:
            raise UnauthorizedError("Maximum attempts reached. Please request a new OTP.")
            
        if not security.verify_password(otp, doc["otp_hash"]):
            await self.otps.update_one({"_id": doc["_id"]}, {"$inc": {"attempts": 1}})
            raise UnauthorizedError("Invalid OTP.")
            
        # Verify success
        await self.otps.update_one({"_id": doc["_id"]}, {"$set": {"verified": True}})
        
        # Issue a signup token (short lived JWT)
        signup_token, _, _ = security.create_reset_token(email)  # reusing reset token logic for simplicity
        return signup_token

    async def complete_signup(
        self,
        *,
        signup_token: str,
        full_name: str,
        password: str,
        phone: str | None,
        accessible_modules: list[str],
        role: str | None = None,
    ) -> dict:
        try:
            payload = security.decode_token(signup_token, security.TOKEN_TYPE_RESET)
        except Exception as exc:
            raise UnauthorizedError("Invalid or expired signup token") from exc
            
        email = payload["sub"]
        
        self._validate_password(password)
        if await self.users.email_exists(email):
            raise ConflictError("An account with this email already exists")
            
        valid_roles = [MEMBER, "venue_owner", "sports_venue_owner", "client", "artist", "band", "player", "coach"]
        assign_role = role if role in valid_roles else MEMBER
        
        document = new_user_document(
            full_name=full_name,
            email=email,
            password_hash=security.hash_password(password),
            phone=phone,
            role=assign_role,
            accessible_modules=accessible_modules,
        )
        created = await self.users.insert(document)
        await self.audit.log(user_id=created["id"], action="complete_signup", module="auth")
        return await self._issue_tokens(created)

    async def login(self, *, email: str, password: str) -> dict:
        user = await self.users.find_active_by_email(email)
        if user is None or not security.verify_password(password, user["password_hash"]):
            raise UnauthorizedError("Invalid email or password")
        if not user.get("is_active", True):
            raise ForbiddenError("Account is deactivated. Contact an administrator.")
        await self.audit.log(user_id=user["id"], action="login", module="auth")
        return await self._issue_tokens(user)

    async def refresh(self, *, refresh_token: str) -> dict:
        try:
            payload = security.decode_token(refresh_token, security.TOKEN_TYPE_REFRESH)
        except Exception as exc:
            raise UnauthorizedError("Invalid or expired refresh token") from exc
        jti = payload.get("jti", "")
        if not await self.tokens.is_active(jti):
            raise UnauthorizedError("Refresh token has been revoked")
        user = await self.users.find_by_id(payload["sub"])
        if user is None or user.get("is_deleted") or not user.get("is_active", True):
            raise UnauthorizedError("Account is unavailable")
        await self.tokens.revoke(jti)  # rotation
        await self.audit.log(user_id=user["id"], action="refresh_token", module="auth")
        return await self._issue_tokens(user)

    async def logout(self, *, user_id: str | None, refresh_token: str | None) -> None:
        if refresh_token:
            try:
                payload = security.decode_token(refresh_token, security.TOKEN_TYPE_REFRESH)
                await self.tokens.revoke(payload.get("jti", ""))
            except Exception:
                pass  # logout is idempotent
        if user_id:
            await self.audit.log(user_id=user_id, action="logout", module="auth")

    async def get_me(self, *, user_id: str) -> dict:
        user = await self.users.find_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")
        return public_user(user)

    async def change_password(
        self, *, user_id: str, current_password: str, new_password: str
    ) -> None:
        user = await self.users.find_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")
        if not security.verify_password(current_password, user["password_hash"]):
            raise UnauthorizedError("Current password is incorrect")
        self._validate_password(new_password)
        await self.users.update_by_id(
            user_id, {"password_hash": security.hash_password(new_password)}
        )
        await self.tokens.revoke_all_for_user(user_id)
        await self.audit.log(user_id=user_id, action="change_password", module="auth")

    async def forgot_password(self, *, email: str) -> dict:
        user = await self.users.find_active_by_email(email)
        # Never leak account existence; always 200.
        if user is None:
            return {
                "message": "If the account exists, password reset instructions have been sent.",
                "reset_token": None,
            }
        token, jti, expires_at = security.create_reset_token(user["id"])
        await self.tokens.store(
            jti=jti,
            user_id=user["id"],
            token_type=security.TOKEN_TYPE_RESET,
            expires_at=expires_at,
        )
        await self.audit.log(user_id=user["id"], action="forgot_password", module="auth")
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        reset_url = f"{frontend_url}/reset-password?token={token}"
        asyncio.create_task(
            self.email_service.send_password_reset_email(
                to_email=user["email"],
                reset_url=reset_url,
                user_name=user.get("full_name") or user.get("name") or "User",
            )
        )

        response: dict = {
            "message": "If the account exists, password reset instructions have been sent.",
            "reset_token": None,
        }
        if settings.APP_ENV != "prod":
            response["reset_token"] = token
        return response

    async def reset_password(self, *, token: str, new_password: str) -> None:
        try:
            payload = security.decode_token(token, security.TOKEN_TYPE_RESET)
        except Exception as exc:
            raise UnauthorizedError("Invalid or expired reset token") from exc
        jti = payload.get("jti", "")
        if not await self.tokens.is_active(jti):
            raise UnauthorizedError("Reset token has already been used")
        user = await self.users.find_by_id(payload["sub"])
        if user is None or user.get("is_deleted"):
            raise NotFoundError("User not found")
        self._validate_password(new_password)
        await self.users.update_by_id(
            user["id"], {"password_hash": security.hash_password(new_password)}
        )
        await self.tokens.revoke(jti)
        await self.tokens.revoke_all_for_user(user["id"])
        await self.audit.log(user_id=user["id"], action="reset_password", module="auth")

    async def update_profile(self, *, user_id: str, full_name: str | None = None, phone: str | None = None) -> dict:
        """Update the authenticated user's own profile fields."""
        from datetime import datetime, timezone
        user = await self.users.find_by_id(user_id)
        if user is None or user.get("is_deleted"):
            raise NotFoundError("User not found")
        updates: dict = {"updated_at": datetime.now(timezone.utc)}
        if full_name is not None:
            updates["full_name"] = full_name.strip()
        if phone is not None:
            updates["phone"] = phone.strip()
        await self.users.update_by_id(user_id, updates)
        updated_user = await self.users.find_by_id(user_id)
        if updated_user is None:
            raise NotFoundError("User not found after update")
        from src.models.user import public_user
        return public_user(updated_user)

