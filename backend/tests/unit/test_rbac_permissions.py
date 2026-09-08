"""Unit tests for RBAC matrix, 10 platform roles, and multi-domain isolation."""
import pytest
from src.constants.roles import (
    ALL_ROLES,
    ADMIN_ROLES,
    SUPER_ADMIN,
    PLATFORM_ADMIN,
    SPORTS_ADMIN,
    BAND_ADMIN,
    COACH,
    VENUE_OWNER,
    ARTIST,
    BAND_MANAGER,
    PLAYER,
    MEMBER,
    MODULE_SPORTS,
    MODULE_BAND,
    PERM_WILDCARD,
    PERM_USERS_READ,
    PERM_USERS_WRITE,
    PERM_ROLES_READ,
    PERM_PAYMENTS_WRITE,
    PERM_MATCHES_WRITE,
    effective_modules,
    has_permission,
    role_definitions,
)


def test_ten_roles_defined():
    expected_roles = {
        "super_admin", "platform_admin", "sports_admin", "band_admin",
        "coach", "venue_owner", "artist", "band_manager", "player", "member"
    }
    assert set(ALL_ROLES) == expected_roles
    assert len(ALL_ROLES) == 10


def test_admin_roles():
    assert SUPER_ADMIN in ADMIN_ROLES
    assert PLATFORM_ADMIN in ADMIN_ROLES
    assert SPORTS_ADMIN not in ADMIN_ROLES
    assert MEMBER not in ADMIN_ROLES


class TestEffectiveModules:
    def test_super_admin_always_gets_all_modules(self):
        assert set(effective_modules(SUPER_ADMIN, [])) == {MODULE_SPORTS, MODULE_BAND}
        assert set(effective_modules(SUPER_ADMIN, ["sports"])) == {MODULE_SPORTS, MODULE_BAND}

    def test_platform_admin_reach(self):
        assert effective_modules(PLATFORM_ADMIN, ["sports", "band"]) == ["sports", "band"]
        assert effective_modules(PLATFORM_ADMIN, ["sports"]) == ["sports"]
        assert effective_modules(PLATFORM_ADMIN, ["band"]) == ["band"]
        assert effective_modules(PLATFORM_ADMIN, []) == []

    def test_sports_roles_cannot_cross_to_band(self):
        for role in [SPORTS_ADMIN, COACH, VENUE_OWNER, PLAYER]:
            # Even if accessible_modules has 'band', sports role cannot access it
            assert effective_modules(role, ["sports", "band"]) == ["sports"]
            assert effective_modules(role, ["band"]) == []

    def test_band_roles_cannot_cross_to_sports(self):
        for role in [BAND_ADMIN, ARTIST, BAND_MANAGER]:
            # Even if accessible_modules has 'sports', band role cannot access it
            assert effective_modules(role, ["sports", "band"]) == ["band"]
            assert effective_modules(role, ["sports"]) == []

    def test_member_reach(self):
        assert effective_modules(MEMBER, ["sports"]) == ["sports"]
        assert effective_modules(MEMBER, ["band"]) == ["band"]
        assert effective_modules(MEMBER, ["sports", "band"]) == ["sports", "band"]
        assert effective_modules(MEMBER, []) == []

    def test_invalid_module_discarded(self):
        assert effective_modules(MEMBER, ["invalid_domain", "crypto"]) == []


class TestPermissionMatrix:
    def test_super_admin_has_wildcard(self):
        assert has_permission(SUPER_ADMIN, PERM_WILDCARD)
        assert has_permission(SUPER_ADMIN, "users:delete")
        assert has_permission(SUPER_ADMIN, "system:nuclear")

    def test_platform_admin_permissions(self):
        assert has_permission(PLATFORM_ADMIN, PERM_USERS_READ)
        assert has_permission(PLATFORM_ADMIN, PERM_USERS_WRITE)
        assert has_permission(PLATFORM_ADMIN, PERM_ROLES_READ)
        assert has_permission(PLATFORM_ADMIN, PERM_PAYMENTS_WRITE)

    def test_sports_admin_cannot_write_users(self):
        assert not has_permission(SPORTS_ADMIN, PERM_USERS_WRITE)
        assert has_permission(SPORTS_ADMIN, PERM_ROLES_READ)
        assert has_permission(SPORTS_ADMIN, PERM_MATCHES_WRITE)

    def test_coach_and_player_permissions(self):
        assert has_permission(COACH, PERM_MATCHES_WRITE)
        assert not has_permission(PLAYER, PERM_MATCHES_WRITE)
        assert not has_permission(COACH, PERM_ROLES_READ)
        assert not has_permission(PLAYER, PERM_ROLES_READ)

    def test_member_has_only_basic_read(self):
        assert not has_permission(MEMBER, PERM_USERS_READ)
        assert not has_permission(MEMBER, PERM_USERS_WRITE)
        assert not has_permission(MEMBER, PERM_ROLES_READ)
        assert not has_permission(MEMBER, PERM_PAYMENTS_WRITE)


def test_role_definitions():
    defs = role_definitions()
    assert len(defs) == 10
    for d in defs:
        assert "role_name" in d
        assert "description" in d
        assert "permissions" in d
        assert "allowed_modules" in d
        assert isinstance(d["permissions"], list)
        assert isinstance(d["allowed_modules"], list)
