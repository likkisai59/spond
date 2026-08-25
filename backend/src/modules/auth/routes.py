"""Auth endpoints (/api/v1/auth/*)."""
from fastapi import APIRouter, Depends, Request, status

from src.dependencies.auth import get_current_user
from src.schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPairResponse,
)
from src.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _ok(data, status_code: int = 200) -> dict:
    return {"status": "success", "data": data}


@router.post(
    "/register",
    response_model=None,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new platform user",
)
async def register(payload: RegisterRequest) -> dict:
    session = await AuthService().register(
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
        phone=payload.phone,
        accessible_modules=payload.accessible_modules,
        role=payload.role,
    )
    return _ok(TokenPairResponse(**session).model_dump(mode="json"), 201)


@router.post("/login", summary="Login with email + password")
async def login(payload: LoginRequest) -> dict:
    session = await AuthService().login(
        email=payload.email, password=payload.password
    )
    return _ok(TokenPairResponse(**session).model_dump(mode="json"))


@router.post("/refresh-token", summary="Rotate refresh token, issue new pair")
async def refresh_token(payload: RefreshTokenRequest) -> dict:
    session = await AuthService().refresh(refresh_token=payload.refresh_token)
    return _ok(TokenPairResponse(**session).model_dump(mode="json"))


@router.post("/logout", summary="Revoke refresh token (idempotent)")
async def logout(
    payload: LogoutRequest,
    user: dict = Depends(get_current_user),
) -> dict:
    await AuthService().logout(user_id=user["id"], refresh_token=payload.refresh_token)
    return _ok(MessageResponse(message="Logged out").model_dump())


@router.get("/me", summary="Current authenticated user")
async def me(user: dict = Depends(get_current_user)) -> dict:
    return _ok(user)


@router.post("/change-password", summary="Change own password (revokes sessions)")
async def change_password(
    payload: ChangePasswordRequest,
    user: dict = Depends(get_current_user),
) -> dict:
    await AuthService().change_password(
        user_id=user["id"],
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return _ok(MessageResponse(message="Password updated").model_dump())


@router.post("/forgot-password", summary="Request a password reset token")
async def forgot_password(payload: ForgotPasswordRequest) -> dict:
    result = await AuthService().forgot_password(email=payload.email)
    return _ok(ForgotPasswordResponse(**result).model_dump())


@router.post("/reset-password", summary="Reset password using a reset token")
async def reset_password(payload: ResetPasswordRequest) -> dict:
    await AuthService().reset_password(
        token=payload.token, new_password=payload.new_password
    )
    return _ok(MessageResponse(message="Password has been reset").model_dump())
