"""Unit tests for AuthService (registration, login, refresh rotation, logout, password flows)."""
import pytest
from src.services.auth_service import AuthService
from src.exceptions.handlers import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)
from src.constants.roles import MEMBER, VENUE_OWNER


@pytest.fixture
def auth_service():
    return AuthService()


@pytest.mark.asyncio
async def test_register_success(auth_service):
    res = await auth_service.register(
        full_name="Alice Smith",
        email="alice@example.com",
        password="SecurePassword1",
        phone="+919876543210",
        accessible_modules=["sports"],
    )
    assert "user" in res
    assert res["user"]["email"] == "alice@example.com"
    assert res["user"]["role"] == MEMBER
    assert "access_token" in res
    assert "refresh_token" in res


@pytest.mark.asyncio
async def test_register_duplicate_email(auth_service):
    await auth_service.register(
        full_name="Bob Jones",
        email="bob@example.com",
        password="SecurePassword1",
        phone=None,
        accessible_modules=["sports"],
    )
    with pytest.raises(ConflictError) as exc_info:
        await auth_service.register(
            full_name="Bob Duplicate",
            email="bob@example.com",
            password="SecurePassword2",
            phone=None,
            accessible_modules=["sports"],
        )
    assert "already exists" in str(exc_info.value.message)


@pytest.mark.asyncio
async def test_register_weak_password(auth_service):
    with pytest.raises(UnauthorizedError) as exc_info:
        await auth_service.register(
            full_name="Weak Pass",
            email="weak@example.com",
            password="short",
            phone=None,
            accessible_modules=["sports"],
        )
    assert "at least 8 characters" in str(exc_info.value.message)


@pytest.mark.asyncio
async def test_register_venue_owner(auth_service):
    res = await auth_service.register(
        full_name="Venue Admin",
        email="venue@example.com",
        password="SecurePassword1",
        phone="+919876543211",
        accessible_modules=["sports"],
        role=VENUE_OWNER,
    )
    assert res["user"]["role"] == VENUE_OWNER


@pytest.mark.asyncio
async def test_login_success(auth_service):
    await auth_service.register(
        full_name="Charlie Login",
        email="charlie@example.com",
        password="Password123",
        phone=None,
        accessible_modules=["sports"],
    )
    res = await auth_service.login(email="charlie@example.com", password="Password123")
    assert res["user"]["email"] == "charlie@example.com"
    assert "access_token" in res
    assert "refresh_token" in res


@pytest.mark.asyncio
async def test_login_invalid_password(auth_service):
    await auth_service.register(
        full_name="Dave Wrong",
        email="dave@example.com",
        password="Password123",
        phone=None,
        accessible_modules=["sports"],
    )
    with pytest.raises(UnauthorizedError) as exc_info:
        await auth_service.login(email="dave@example.com", password="WrongPassword123")
    assert "Invalid email or password" in str(exc_info.value.message)


@pytest.mark.asyncio
async def test_login_nonexistent_email(auth_service):
    with pytest.raises(UnauthorizedError) as exc_info:
        await auth_service.login(email="nonexistent@example.com", password="Password123")
    assert "Invalid email or password" in str(exc_info.value.message)


@pytest.mark.asyncio
async def test_login_inactive_user(auth_service):
    registered = await auth_service.register(
        full_name="Inactive User",
        email="inactive@example.com",
        password="Password123",
        phone=None,
        accessible_modules=["sports"],
    )
    # Manually deactivate user in DB
    await auth_service.users.update_by_id(registered["user"]["id"], {"is_active": False})
    
    with pytest.raises(ForbiddenError) as exc_info:
        await auth_service.login(email="inactive@example.com", password="Password123")
    assert "deactivated" in str(exc_info.value.message)


@pytest.mark.asyncio
async def test_refresh_token_rotation(auth_service):
    reg = await auth_service.register(
        full_name="Rotation User",
        email="rotate@example.com",
        password="Password123",
        phone=None,
        accessible_modules=["sports"],
    )
    first_refresh = reg["refresh_token"]
    
    # First rotation: succeeds and gives new refresh token
    rotated = await auth_service.refresh(refresh_token=first_refresh)
    assert "access_token" in rotated
    assert "refresh_token" in rotated
    second_refresh = rotated["refresh_token"]
    assert second_refresh != first_refresh

    # Second try with first_refresh must fail because old JTI was revoked
    with pytest.raises(UnauthorizedError) as exc_info:
        await auth_service.refresh(refresh_token=first_refresh)
    assert "revoked" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_logout(auth_service):
    reg = await auth_service.register(
        full_name="Logout User",
        email="logout@example.com",
        password="Password123",
        phone=None,
        accessible_modules=["sports"],
    )
    user_id = reg["user"]["id"]
    refresh_token = reg["refresh_token"]

    await auth_service.logout(user_id=user_id, refresh_token=refresh_token)

    # After logout, refresh token cannot be reused
    with pytest.raises(UnauthorizedError):
        await auth_service.refresh(refresh_token=refresh_token)


@pytest.mark.asyncio
async def test_change_password(auth_service):
    reg = await auth_service.register(
        full_name="Change Pass User",
        email="changepass@example.com",
        password="OldPassword123",
        phone=None,
        accessible_modules=["sports"],
    )
    user_id = reg["user"]["id"]

    # Wrong old password fails
    with pytest.raises(UnauthorizedError):
        await auth_service.change_password(
            user_id=user_id,
            current_password="WrongOldPassword1",
            new_password="NewPassword123",
        )

    # Successful password change
    await auth_service.change_password(
        user_id=user_id,
        current_password="OldPassword123",
        new_password="NewPassword123",
    )

    # Login with new password succeeds
    login_res = await auth_service.login(email="changepass@example.com", password="NewPassword123")
    assert login_res["user"]["id"] == user_id


@pytest.mark.asyncio
async def test_forgot_and_reset_password(auth_service):
    reg = await auth_service.register(
        full_name="Reset User",
        email="reset@example.com",
        password="Password123",
        phone=None,
        accessible_modules=["sports"],
    )
    user_id = reg["user"]["id"]

    # Request reset token (in dev/test mode returned in response)
    reset_info = await auth_service.forgot_password(email="reset@example.com")
    reset_token = reset_info.get("reset_token")
    assert reset_token is not None

    # Reset password with valid token
    await auth_service.reset_password(token=reset_token, new_password="BrandNewPassword123")

    # Login with brand new password succeeds
    res = await auth_service.login(email="reset@example.com", password="BrandNewPassword123")
    assert res["user"]["id"] == user_id

    # Token cannot be reused (single-use)
    with pytest.raises(UnauthorizedError):
        await auth_service.reset_password(token=reset_token, new_password="AnotherPassword123")
