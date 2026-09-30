"""Shared fixtures for the VigiRail API test-suite."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.security import rate_limiter
from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """Session-scoped client; entering the context runs the lifespan
    (which trains the ML model once for the whole suite)."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def clear_rate_limits():
    """Each test starts with a clean login rate-limiter."""
    rate_limiter.reset()
    yield
    rate_limiter.reset()


def login(client: TestClient, username: str = "admin", password: str = "admin123") -> str:
    """Helper: exchange credentials for a bearer token."""
    response = client.post(
        "/api/auth/login",
        data={"username": username, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
