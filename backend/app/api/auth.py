"""
RailGuard AI — Authentication API Routes
POST /api/auth/login  → returns JWT token + user info
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.auth import verify_password, get_user, create_access_token
from app.models.schemas import LoginResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user with username + password.
    Returns a JWT access token and user role information.
    """
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(data={"sub": form_data.username})
    print(f"[AUTH] Login: {form_data.username} ({user['role']})")
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        username=form_data.username,
        role=user["role"],
        full_name=user["full_name"],
    )
