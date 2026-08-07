from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=64)
    address: str = Field(..., min_length=1, max_length=512)
    city: str = Field(..., min_length=1, max_length=120)
    state: str = Field(..., min_length=1, max_length=120)
    country: str = Field(..., min_length=1, max_length=120)
    industry: str = Field(..., min_length=1, max_length=120)
    company_type: str = Field(..., min_length=1, max_length=80)


class CompanyCreate(CompanyBase):
    pass


class CompanyRead(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
