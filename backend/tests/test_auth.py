"""Authentication and authorisation tests."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.core.security import (
    TokenError,
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from tests.conftest import auth_header, login


# ── Password hashing ───────────────────────────────────────────────────
def test_password_hash_roundtrip():
    encoded = hash_password("s3cret-pass")
    assert encoded.startswith("pbkdf2_sha256$")
    assert verify_password("s3cret-pass", encoded)
    assert not verify_password("wrong", encoded)
    # Unique salts → different hashes for the same input.
    assert hash_password("s3cret-pass") != encoded


def test_verify_password_rejects_garbage():
    assert not verify_password("x", "not-a-valid-hash")
    assert not verify_password("x", "")


# ── JWT ────────────────────────────────────────────────────────────────
def test_jwt_roundtrip_and_expiry():
    token = create_access_token(
        subject="admin", role="Admin", secret_key="k", expires_minutes=5, now=1_000_000
    )
    payload = decode_token(token, secret_key="k", now=1_000_100)
    assert payload["sub"] == "admin"
    assert payload["role"] == "Admin"
    assert payload["typ"] == "access"
    # Expired
    try:
        decode_token(token, secret_key="k", now=2_000_000)
        raise AssertionError("expected TokenError")
    except TokenError:
        pass


def test_jwt_rejects_wrong_key_and_altered_payload():
    token = create_access_token(
        subject="admin", role="Admin", secret_key="right", expires_minutes=5
    )
    try:
        decode_token(token, secret_key="wrong")
        raise AssertionError("expected TokenError")
    except TokenError:
        pass
    # Tamper with the payload segment.
    header, payload, sig = token.split(".")
    try:
        decode_token(f"{header}.{payload}x.{sig}", secret_key="right")
        raise AssertionError("expected TokenError")
    except TokenError:
        pass


# ── Login endpoint ─────────────────────────────────────────────────────
def test_login_success(client: TestClient):
    response = client.post(
        "/api/auth/login", data={"username": "engineer", "password": "eng456"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["role"] == "Engineer"
    assert body["full_name"] == "Rahul Sharma"
    assert len(body["access_token"].split(".")) == 3


def test_login_wrong_password(client: TestClient):
    response = client.post(
        "/api/auth/login", data={"username": "admin", "password": "nope"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_unknown_user_same_error(client: TestClient):
    response = client.post(
        "/api/auth/login", data={"username": "ghost", "password": "nope"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_rate_limited(client: TestClient):
    # 10 attempts allowed per 60 s window (settings.login_rate_limit).
    for _ in range(10):
        client.post("/api/auth/login", data={"username": "brute", "password": "x"})
    response = client.post(
        "/api/auth/login", data={"username": "brute", "password": "x"}
    )
    assert response.status_code == 429
    assert "Retry-After" in response.headers


def test_me_endpoint(client: TestClient):
    token = login(client, "inspector", "insp321")
    response = client.get("/api/auth/me", headers=auth_header(token))
    assert response.status_code == 200
    assert response.json() == {
        "username": "inspector",
        "role": "Inspector",
        "full_name": "Dr. Amit Kumar",
    }


def test_me_rejects_missing_and_bad_tokens(client: TestClient):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get(
        "/api/auth/me", headers=auth_header("abc.def.ghi")
    ).status_code == 401
