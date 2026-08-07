from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=120)
    last_name: str = Field(..., min_length=1, max_length=120)
    phone: Optional[str] = Field(None, max_length=32)
    role: str = Field("buyer", pattern="^(admin|buyer|supplier|transporter)$")
    company_id: Optional[int] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=120)
    last_name: Optional[str] = Field(None, max_length=120)
    phone: Optional[str] = Field(None, max_length=32)
    role: Optional[str] = Field(None, pattern="^(admin|buyer|supplier|transporter)$")
    company_id: Optional[int] = None
    is_active: Optional[bool] = None
