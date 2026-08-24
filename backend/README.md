# Unify Platform API (Phase 1)

FastAPI + MongoDB (Motor, async) + Pydantic v2 + JWT backend for the Unified
Sports + Band platform. Phase 1 covers **Foundation, Auth, Users, Roles,
Platform Core**. Groups/Events/Venues/Bookings/Payments/Files/Messages land in
later phases.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # set JWT_SECRET_KEY
uvicorn src.app.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs · ReDoc: /redoc · Health: /health

## Docker (API + MongoDB + Redis)

```bash
cd backend
docker compose up --build
```

## Seeded on startup

- 10 roles with permissions + allowed modules (`roles` collection)
- Bootstrap super admin `BOOTSTRAP_SUPER_ADMIN_EMAIL` / `..._PASSWORD` (dev)

## Auth flow

register/login → `{ user, access_token, refresh_token }` (snake_case).
`POST /api/v1/auth/refresh-token` **rotates** the refresh token (old jti revoked).
`POST /api/v1/auth/logout` revokes the presented refresh token. Password
change/reset revokes all sessions. Reset tokens are single-use; in non-prod the
forgot-password response includes the token (email service arrives later).

## Error envelope (matches frontend `ApiErrorBody`)

```json
{ "statusCode": 401, "message": "Invalid or expired access token", "code": "UNAUTHORIZED", "details": {} }
```

Success envelope: `{ "status": "success", "data": { ... } }`

## RBAC (constants/roles.py is the single source of truth)

| Role | Modules | Platform permissions |
|---|---|---|
| super_admin | sports + band | `*` |
| platform_admin | sports + band | users:read/write, roles:read, audit:read |
| sports_admin | sports | roles:read |
| band_admin | band | roles:read |
| coach / venue_owner / player | sports | basic |
| artist / band_manager | band | basic |
| member | per accessible_modules | basic |

Effective reach = `user.accessible_modules` ∩ role capability (admins bypass).

## Tests

```bash
pytest
```
