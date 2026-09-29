"""
VigiRail — Cryptographic primitives.

Implemented with the Python standard library only (no PyJWT / passlib):

* Passwords  — PBKDF2-HMAC-SHA256, per-password random salt, constant-time
  comparison.  Format: ``pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>``.
* JWTs       — HS256, algorithm pinned during verification (defends against
  ``alg: none`` / key-confusion attacks), ``exp``/``iat``/``typ`` claims.
* Rate limit — in-memory sliding-window limiter used on the login endpoint.

For a multi-instance deployment swap the limiter for Redis; the interface is
intentionally tiny to make that swap trivial.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import threading
import time
from collections import deque

# OWASP recommendation for PBKDF2-HMAC-SHA256 (2023+).
PBKDF2_ITERATIONS = 260_000
JWT_ALGORITHM = "HS256"


class TokenError(Exception):
    """Raised when a JWT is malformed, forged, or expired."""


# ────────────────────────────────────────────────────────────────────
# Password hashing
# ────────────────────────────────────────────────────────────────────
def hash_password(password: str, *, iterations: int = PBKDF2_ITERATIONS) -> str:
    if not password:
        raise ValueError("Password must not be empty")
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algo, iterations, salt, expected = encoded.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt), int(iterations)
        )
        return hmac.compare_digest(digest.hex(), expected)
    except (ValueError, TypeError):
        return False


# ────────────────────────────────────────────────────────────────────
# JWT (HS256, stdlib)
# ────────────────────────────────────────────────────────────────────
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def create_access_token(
    *,
    subject: str,
    role: str,
    secret_key: str,
    expires_minutes: int,
    now: float | None = None,
) -> str:
    issued_at = int(now if now is not None else time.time())
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": subject,
        "role": role,
        "typ": "access",
        "iat": issued_at,
        "exp": issued_at + expires_minutes * 60,
    }
    signing_input = f"{_b64url_encode(json.dumps(header).encode())}." \
                    f"{_b64url_encode(json.dumps(payload).encode())}"
    signature = hmac.new(secret_key.encode("utf-8"), signing_input.encode("ascii"),
                        hashlib.sha256).digest()
    return f"{signing_input}.{_b64url_encode(signature)}"


def decode_token(token: str, *, secret_key: str, now: float | None = None) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise TokenError("Token must have three segments")
        header_b64, payload_b64, signature_b64 = parts

        header = json.loads(_b64url_decode(header_b64))
        # Pin the algorithm — never trust whatever the token claims.
        if header.get("alg") != JWT_ALGORITHM:
            raise TokenError("Unsupported token algorithm")

        expected = hmac.new(
            secret_key.encode("utf-8"),
            f"{header_b64}.{payload_b64}".encode("ascii"),
            hashlib.sha256,
        ).digest()
        actual = _b64url_decode(signature_b64)
        if not hmac.compare_digest(expected, actual):
            raise TokenError("Invalid signature")

        payload = json.loads(_b64url_decode(payload_b64))
        current = now if now is not None else time.time()
        if payload.get("typ") != "access":
            raise TokenError("Unexpected token type")
        if not isinstance(payload.get("exp"), (int, float)) or current >= payload["exp"]:
            raise TokenError("Token expired")
        if not payload.get("sub"):
            raise TokenError("Token missing subject")
        return payload
    except TokenError:
        raise
    except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise TokenError("Malformed token") from exc


# ────────────────────────────────────────────────────────────────────
# Sliding-window rate limiter (in-memory)
# ────────────────────────────────────────────────────────────────────
class SlidingWindowRateLimiter:
    """Returns True while a key is under its per-window allowance."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str, *, limit: int, window_seconds: int) -> bool:
        now = time.monotonic()
        with self._lock:
            bucket = self._hits.setdefault(key, deque())
            cutoff = now - window_seconds
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()
            if len(bucket) >= limit:
                return False
            bucket.append(now)
            return True

    def reset(self, key: str | None = None) -> None:
        with self._lock:
            if key is None:
                self._hits.clear()
            else:
                self._hits.pop(key, None)


rate_limiter = SlidingWindowRateLimiter()
