"""
VigiRail — FastAPI dependencies: authentication and role guards.
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import TokenError, decode_token
from app.core.users import UserRecord, get_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@dataclass(frozen=True)
class AuthUser:
    username: str
    role: str
    full_name: str

    @classmethod
    def from_record(cls, record: UserRecord) -> AuthUser:
        return cls(username=record.username, role=record.role, full_name=record.full_name)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(token: str = Depends(oauth2_scheme)) -> AuthUser:
    """Validate the bearer JWT and resolve it to a known user record.

    The role is always read from the server-side user store — never trusted
    from the token payload — so demoting a user takes effect immediately.
    """
    try:
        payload = decode_token(token, secret_key=settings.secret_key)
    except TokenError as exc:
        raise _unauthorized(str(exc)) from exc

    record = get_user(payload["sub"])
    if record is None:
        raise _unauthorized("User no longer exists")
    return AuthUser.from_record(record)


def require_roles(*roles: str):
    """Dependency factory: allow only the listed roles (HTTP 403 otherwise)."""
    allowed = frozenset(roles)

    def dependency(user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' is not permitted — requires one of: {', '.join(sorted(allowed))}",
            )
        return user

    return dependency
