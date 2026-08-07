from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RFQCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=120)
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=50)
    delivery_location: str = Field(..., min_length=1, max_length=255)
    currency: str = Field(..., min_length=3, max_length=10)


class RFQRead(RFQCreate):
    id: int
    status: str
    buyer_id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuoteCreate(BaseModel):
    price_per_unit: float = Field(..., gt=0)
    total_amount: float = Field(..., gt=0)
    currency: str = Field(..., min_length=3, max_length=10)
    notes: str | None = None


class QuoteRead(QuoteCreate):
    id: int
    rfq_id: int
    supplier_id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
