"""API surface tests (no DB): OpenAPI contract + validation envelope."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

import pytest
from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)  # no context manager -> lifespan (DB) not started


EXPECTED_PATHS = {
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/refresh-token",
    "/api/v1/auth/logout",
    "/api/v1/auth/me",
    "/api/v1/auth/change-password",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
    "/api/v1/users",
    "/api/v1/users/{user_id}",
    "/api/v1/users/{user_id}/status",
    "/api/v1/roles",
    "/api/v1/roles/{role_id}",
    "/api/v1/health",
    "/api/v1/version",
    "/health",
    "/version",
}


def test_openapi_contains_all_phase1_endpoints():
    spec = client.get("/openapi.json").json()
    missing = EXPECTED_PATHS - set(spec["paths"].keys())
    assert not missing, f"missing endpoints: {missing}"


def test_version_endpoint():
    body = client.get("/version").json()
    assert body["status"] == "success"
    assert body["data"]["service"] == "unify-platform-api"


def test_validation_error_envelope():
    response = client.post("/api/v1/auth/register", json={"email": "not-an-email"})
    assert response.status_code == 422
    body = response.json()
    assert body["statusCode"] == 422
    assert body["code"] == "VALIDATION_ERROR"
    assert "fields" in body["details"]


def test_protected_endpoint_requires_token():
    response = client.get("/api/v1/users")
    assert response.status_code == 401
    assert response.json()["code"] == "UNAUTHORIZED"


def test_register_password_policy_enforced():
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test User", "email": "t@t.com", "password": "short"},
    )
    assert response.status_code == 422
