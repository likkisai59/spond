"""Pydantic request/response schemas (Pydantic v2)."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.constants.roles import ALL_MODULES

ModuleKey = Literal["sports", "band"]


# ---------- auth ----------
class RequestOtpRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class CompleteSignupRequest(BaseModel):
    signup_token: str
    full_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, pattern=r"^[0-9+\-\s]{8,15}$")
    accessible_modules: list[ModuleKey] = Field(default_factory=lambda: ["sports", "band"])
    role: str | None = None


class VerifyOtpResponse(BaseModel):
    signup_token: str


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, pattern=r"^[0-9+\-\s]{8,15}$")
    accessible_modules: list[ModuleKey] = Field(default_factory=lambda: ["sports", "band"])
    role: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ---------- shared ----------
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: EmailStr
    phone: str | None = None
    profile_image: str | None = None
    role: str
    accessible_modules: list[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class TokenPairResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str | None = None  # returned only when APP_ENV != prod (no email service yet)


# ---------- users ----------
class UserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, pattern=r"^[0-9+\-\s]{8,15}$")
    profile_image: str | None = None
    role: str | None = None  # validated against ALL_ROLES in the service
    accessible_modules: list[ModuleKey] | None = None


class UserStatusRequest(BaseModel):
    is_active: bool


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class UserListResponse(BaseModel):
    items: list[UserResponse]
    pagination: PaginationMeta


# ---------- roles ----------
class RoleResponse(BaseModel):
    id: str
    role_name: str
    description: str | None = None
    permissions: list[str]
    allowed_modules: list[str]


class RoleListResponse(BaseModel):
    items: list[RoleResponse]


__all__ = [
    "RegisterRequest",
    "RequestOtpRequest",
    "VerifyOtpRequest",
    "CompleteSignupRequest",
    "VerifyOtpResponse",
    "LoginRequest",
    "RefreshTokenRequest",
    "LogoutRequest",
    "ChangePasswordRequest",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    "UserResponse",
    "TokenPairResponse",
    "MessageResponse",
    "ForgotPasswordResponse",
    "UserUpdateRequest",
    "UserStatusRequest",
    "PaginationMeta",
    "UserListResponse",
    "RoleResponse",
    "RoleListResponse",
]
