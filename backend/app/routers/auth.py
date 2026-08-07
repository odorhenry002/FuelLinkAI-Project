from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, RegisterRequest, RefreshRequest, Token
from app.schemas.user import UserRead
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_user
from app.models import get_db
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    registration: RegisterRequest,
    db: Session = Depends(get_db),
):
    user = AuthService.create_user(db, registration)
    return user


@router.post("/login", response_model=Token)
def login_user(
    login: LoginRequest,
    db: Session = Depends(get_db),
):
    user = AuthService.authenticate_user(db, login)
    return AuthService.create_token_response(user)


@router.post("/refresh", response_model=Token)
def refresh_token(
    request: RefreshRequest,
):
    return AuthService.refresh_tokens(request.refresh_token)


@router.get("/me", response_model=UserRead)
def read_authenticated_user(current_user: User = Depends(get_current_user)):
    return current_user
