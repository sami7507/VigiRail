"""
RailGuard AI — Authentication Module
Implements JWT token creation/verification using Python stdlib only.
No external jose/passlib dependency — compatible with Python 3.13.
"""
import hashlib
import hmac
import base64
import json
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY             = "railguard-sih-secret-2024-xk9p"
ACCESS_TOKEN_EXPIRE_MIN = 60
oauth2_scheme           = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ── User database (replace with real DB in production) ──────────
def _hash(password: str) -> str:
    salt = "railguard_fixed_salt_2024"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

USERS_DB: dict = {
    "admin":    {"password": _hash("admin123"),  "role": "Admin",    "full_name": "System Administrator"},
    "engineer": {"password": _hash("eng456"),    "role": "Engineer", "full_name": "Rahul Sharma"},
    "operator": {"password": _hash("ops789"),    "role": "Operator", "full_name": "Priya Singh"},
    "inspector":{"password": _hash("insp321"),   "role": "Inspector","full_name": "Dr. Amit Kumar"},
}

# ── JWT helpers ─────────────────────────────────────────────────
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64url_decode(s: str) -> bytes:
    pad = 4 - len(s) % 4
    if pad != 4:
        s += "=" * pad
    return base64.urlsafe_b64decode(s)

def create_access_token(data: dict, expire_minutes: int = ACCESS_TOKEN_EXPIRE_MIN) -> str:
    header  = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = dict(data)
    payload["exp"] = (datetime.utcnow() + timedelta(minutes=expire_minutes)).timestamp()
    payload_enc = _b64url_encode(json.dumps(payload).encode())
    msg = f"{header}.{payload_enc}".encode()
    sig = hmac.new(SECRET_KEY.encode(), msg, hashlib.sha256).digest()
    return f"{header}.{payload_enc}.{_b64url_encode(sig)}"

def decode_token(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token format")
        header, payload_enc, sig_enc = parts
        msg          = f"{header}.{payload_enc}".encode()
        expected_sig = hmac.new(SECRET_KEY.encode(), msg, hashlib.sha256).digest()
        actual_sig   = _b64url_decode(sig_enc)
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Invalid signature")
        payload = json.loads(_b64url_decode(payload_enc))
        if datetime.utcnow().timestamp() > payload.get("exp", 0):
            raise ValueError("Token expired")
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_password(plain: str, hashed: str) -> bool:
    return _hash(plain) == hashed

def get_user(username: str) -> dict | None:
    return USERS_DB.get(username)
