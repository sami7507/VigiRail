"""
VigiRail — Authentication API.

POST /api/auth/login  — OAuth2 password flow, rate-limited
GET  /api/auth/me     — identity of the calling token
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import AuthUser, get_current_user
from app.core.security import rate_limiter, verify_password
from app.core.users import get_user
from app.models.schemas import LoginResponse, UserOut

logger = logging.getLogger("vigirail.auth")

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> LoginResponse:
    """Authenticate with username + password and receive a JWT bearer token."""
    username = form_data.username.strip().lower()
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{client_ip}:{username}"

    if not rate_limiter.allow(
        rate_key,
        limit=settings.login_rate_limit,
        window_seconds=settings.login_rate_window,
    ):
        logger.warning("Rate limit hit for %s", rate_key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Try again in a minute.",
            headers={"Retry-After": str(settings.login_rate_window)},
        )

    record = get_user(username)
    # Same generic message for unknown user vs wrong password (no enumeration).
    if record is None or not verify_password(form_data.password, record.password_hash):
        logger.info("Failed login for '%s' from %s", username, client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    from app.core.security import create_access_token

    token = create_access_token(
        subject=record.username,
        role=record.role,
        secret_key=settings.secret_key,
        expires_minutes=settings.access_token_expire_minutes,
    )
    logger.info("Login OK: %s (%s) from %s", record.username, record.role, client_ip)
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        username=record.username,
        role=record.role,
        full_name=record.full_name,
        expires_in_minutes=settings.access_token_expire_minutes,
    )


@router.get("/me", response_model=UserOut)
def me(user: AuthUser = Depends(get_current_user)) -> UserOut:
    """Return the identity and role attached to the current token."""
    return UserOut(username=user.username, role=user.role, full_name=user.full_name)
