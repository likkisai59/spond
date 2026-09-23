"""Roles, RBAC matrix and module-access rules (single source of truth)."""

SUPER_ADMIN = "super_admin"
PLATFORM_ADMIN = "platform_admin"
SPORTS_ADMIN = "sports_admin"
BAND_ADMIN = "band_admin"
COACH = "coach"
VENUE_OWNER = "venue_owner"
SPORTS_VENUE_OWNER = "sports_venue_owner"
ARTIST = "artist"
BAND_MANAGER = "band_manager"
PLAYER = "player"
MEMBER = "member"

CLIENT = "client"
BAND = "band"

ALL_ROLES = [
    SUPER_ADMIN,
    PLATFORM_ADMIN,
    SPORTS_ADMIN,
    BAND_ADMIN,
    COACH,
    VENUE_OWNER,
    SPORTS_VENUE_OWNER,
    ARTIST,
    BAND_MANAGER,
    PLAYER,
    MEMBER,
    CLIENT,
    BAND,
]

ADMIN_ROLES = [SUPER_ADMIN, PLATFORM_ADMIN]

MODULE_SPORTS = "sports"
MODULE_BAND = "band"
ALL_MODULES = [MODULE_SPORTS, MODULE_BAND]

# Role -> modules the role may ever reach (intersected with user.accessible_modules)
ROLE_MODULES: dict[str, list[str]] = {
    SUPER_ADMIN: ALL_MODULES,
    PLATFORM_ADMIN: ALL_MODULES,
    SPORTS_ADMIN: [MODULE_SPORTS],
    BAND_ADMIN: [MODULE_BAND],
    COACH: [MODULE_SPORTS],
    VENUE_OWNER: [MODULE_SPORTS, MODULE_BAND],
    SPORTS_VENUE_OWNER: [MODULE_SPORTS],
    ARTIST: [MODULE_BAND],
    BAND_MANAGER: [MODULE_BAND],
    PLAYER: [MODULE_SPORTS],
    MEMBER: ALL_MODULES,
    CLIENT: [MODULE_BAND],
    BAND: [MODULE_BAND],
}

# Permission strings (Phase 1 set; module-scoped permissions land in later phases)
PERM_USERS_READ = "users:read"
PERM_USERS_WRITE = "users:write"
PERM_ROLES_READ = "roles:read"
PERM_AUDIT_READ = "audit:read"
PERM_PAYMENTS_READ = "payments:read"
PERM_PAYMENTS_WRITE = "payments:write"
PERM_FILES_READ = "files:read"
PERM_FILES_WRITE = "files:write"
PERM_MATCHES_READ = "matches:read"
PERM_MATCHES_WRITE = "matches:write"
PERM_ANALYTICS_READ = "analytics:read"
PERM_WILDCARD = "*"

ROLE_PERMISSIONS: dict[str, list[str]] = {
    SUPER_ADMIN: [PERM_WILDCARD],
    PLATFORM_ADMIN: [
        PERM_USERS_READ,
        PERM_USERS_WRITE,
        PERM_ROLES_READ,
        PERM_AUDIT_READ,
        PERM_PAYMENTS_READ,
        PERM_PAYMENTS_WRITE,
        PERM_FILES_READ,
        PERM_FILES_WRITE,
        PERM_MATCHES_READ,
        PERM_MATCHES_WRITE,
        PERM_ANALYTICS_READ,
    ],
    SPORTS_ADMIN: [
        PERM_ROLES_READ,
        PERM_PAYMENTS_READ,
        PERM_PAYMENTS_WRITE,
        PERM_FILES_READ,
        PERM_FILES_WRITE,
        PERM_MATCHES_READ,
        PERM_MATCHES_WRITE,
        PERM_ANALYTICS_READ,
    ],
    BAND_ADMIN: [
        PERM_ROLES_READ,
        PERM_PAYMENTS_READ,
        PERM_PAYMENTS_WRITE,
        PERM_FILES_READ,
        PERM_FILES_WRITE,
        PERM_ANALYTICS_READ,
    ],
    COACH: [
        PERM_FILES_WRITE,
        PERM_FILES_READ,
        PERM_PAYMENTS_READ,
        PERM_MATCHES_READ,
        PERM_MATCHES_WRITE,
        PERM_ANALYTICS_READ,
    ],
    VENUE_OWNER: [
        PERM_FILES_WRITE,
        PERM_FILES_READ,
        PERM_PAYMENTS_READ,
        PERM_ANALYTICS_READ,
    ],
    SPORTS_VENUE_OWNER: [
        PERM_FILES_WRITE,
        PERM_FILES_READ,
        PERM_PAYMENTS_READ,
        PERM_ANALYTICS_READ,
    ],
    ARTIST: [
        PERM_FILES_WRITE,
        PERM_FILES_READ,
        PERM_ANALYTICS_READ,
    ],
    BAND_MANAGER: [
        PERM_FILES_WRITE,
        PERM_FILES_READ,
        PERM_PAYMENTS_READ,
        PERM_PAYMENTS_WRITE,
        PERM_ANALYTICS_READ,
    ],
    PLAYER: [
        PERM_FILES_WRITE,
        PERM_FILES_READ,
        PERM_PAYMENTS_READ,
        PERM_MATCHES_READ,
        PERM_ANALYTICS_READ,
    ],
    MEMBER: [PERM_FILES_READ, PERM_PAYMENTS_READ],
    CLIENT: [PERM_FILES_READ, PERM_PAYMENTS_READ, PERM_PAYMENTS_WRITE],
    BAND: [PERM_FILES_READ, PERM_FILES_WRITE, PERM_PAYMENTS_READ],
}

ROLE_DESCRIPTIONS = {
    SUPER_ADMIN: "Full platform control across both products",
    PLATFORM_ADMIN: "Administers Sports + Band products",
    SPORTS_ADMIN: "Administers the Sports product only",
    BAND_ADMIN: "Administers the Band product only",
    COACH: "Runs teams, sessions and attendance (Sports)",
    VENUE_OWNER: "Manages venue listings and slots (Sports & Band)",
    SPORTS_VENUE_OWNER: "Manages sports turf/court listings and slots (Sports)",
    ARTIST: "Performer profile and bookings (Band)",
    BAND_MANAGER: "Manages bands and bookings (Band)",
    PLAYER: "Team member participation (Sports)",
    MEMBER: "Basic access to permitted modules",
    CLIENT: "Books artists and venues (Band)",
    BAND: "Band group profile and gigs (Band)",
}


def effective_modules(role: str, accessible_modules: list[str]) -> list[str]:
    """User's real reach = accessible_modules ∩ role capability (admins bypass)."""
    if role == SUPER_ADMIN:
        return list(ALL_MODULES)
    allowed = set(ROLE_MODULES.get(role, []))
    return [m for m in accessible_modules if m in allowed]


def has_permission(role: str, permission: str) -> bool:
    perms = ROLE_PERMISSIONS.get(role, [])
    return PERM_WILDCARD in perms or permission in perms


def role_definitions() -> list[dict]:
    """Seed payload for the roles collection."""
    return [
        {
            "role_name": role,
            "description": ROLE_DESCRIPTIONS[role],
            "permissions": ROLE_PERMISSIONS[role],
            "allowed_modules": ROLE_MODULES[role],
        }
        for role in ALL_ROLES
    ]
