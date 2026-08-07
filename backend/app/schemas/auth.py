from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str


class TokenPayload(BaseModel):
    sub: int | str
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RefreshRequest(BaseModel):
    refresh_token: str


class RegisterRequest(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=120)
    last_name: str = Field(..., min_length=1, max_length=120)
    phone: str | None = None
    role: str = Field("buyer", pattern="^(admin|buyer|supplier|transporter)$")
    password: str = Field(..., min_length=8)
