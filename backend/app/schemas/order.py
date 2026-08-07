from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderCreate(BaseModel):
    rfq_id: int
    quote_id: int
    delivery_location: str = Field(..., min_length=1, max_length=255)
    notes: str | None = None


class OrderRead(OrderCreate):
    id: int
    buyer_id: int
    supplier_id: int
    company_id: int
    total_amount: float
    currency: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
