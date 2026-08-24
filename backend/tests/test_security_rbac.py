"""Unit tests that don't need MongoDB."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

import pytest
from jose import JWTError

from src.core import security
from src.constants.roles import (
    BAND_ADMIN,
    MEMBER,
    PLATFORM_ADMIN,
    PLAYER,
    SPORTS_ADMIN,
    SUPER_ADMIN,
    effective_modules,
    has_permission,
)


def test_password_hash_roundtrip():
    hashed = security.hash_password("Passw0rd123")
    assert hashed != "Passw0rd123"
    assert security.verify_password("Passw0rd123", hashed)
    assert not security.verify_password("wrong", hashed)


def test_access_token_claims():
    token, _ = security.create_access_token("u1", "a@b.com", PLAYER, ["sports"])
    payload = security.decode_token(token, security.TOKEN_TYPE_ACCESS)
    assert payload["sub"] == "u1"
    assert payload["role"] == PLAYER
    assert payload["modules"] == ["sports"]


def test_refresh_and_reset_token_types_are_enforced():
    refresh, _, _ = security.create_refresh_token("u1")
    with pytest.raises(JWTError):
        security.decode_token(refresh, security.TOKEN_TYPE_ACCESS)
    reset, _, _ = security.create_reset_token("u1")
    with pytest.raises(JWTError):
        security.decode_token(reset, security.TOKEN_TYPE_REFRESH)


def test_tampered_token_rejected():
    token, _ = security.create_access_token("u1", "a@b.com", MEMBER, [])
    with pytest.raises(JWTError):
        security.decode_token(token + "x", security.TOKEN_TYPE_ACCESS)


class TestRbacMatrix:
    def test_super_admin_full(self):
        assert effective_modules(SUPER_ADMIN, []) == ["sports", "band"]
        assert has_permission(SUPER_ADMIN, "anything:at:all")

    def test_platform_admin_both_modules(self):
        assert effective_modules(PLATFORM_ADMIN, ["sports", "band"]) == ["sports", "band"]
        assert has_permission(PLATFORM_ADMIN, "users:write")

    def test_single_module_roles_cannot_cross(self):
        assert effective_modules(SPORTS_ADMIN, ["sports", "band"]) == ["sports"]
        assert effective_modules(BAND_ADMIN, ["sports", "band"]) == ["band"]
        assert effective_modules(PLAYER, ["band"]) == []

    def test_member_gets_accessible_modules(self):
        assert effective_modules(MEMBER, ["sports"]) == ["sports"]

    def test_member_has_no_admin_permissions(self):
        assert not has_permission(MEMBER, "users:read")
        assert not has_permission(PLAYER, "users:write")
