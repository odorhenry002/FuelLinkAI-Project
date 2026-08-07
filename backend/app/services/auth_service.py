from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, login_data: LoginRequest) -> User:
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    @staticmethod
    def create_user(db: Session, registration: RegisterRequest) -> User:
        existing = db.query(User).filter(User.email == registration.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )

        user = User(
            email=registration.email,
            hashed_password=hash_password(registration.password),
            first_name=registration.first_name,
            last_name=registration.last_name,
            phone=registration.phone,
            role=registration.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def create_token_response(user: User) -> Token:
        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        refresh_token = create_refresh_token({"sub": str(user.id), "email": user.email})
        return Token(
            access_token=access_token,
            token_type="bearer",
            refresh_token=refresh_token,
        )

    @staticmethod
    def refresh_tokens(refresh_token: str) -> Token:
        payload = decode_token(refresh_token, expected_token_type="refresh")
        if not payload or "sub" not in payload or "email" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token_data = {"sub": payload["sub"], "email": payload["email"]}
        access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        return Token(
            access_token=access_token,
            token_type="bearer",
            refresh_token=new_refresh_token,
        )
