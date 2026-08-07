from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InvoiceCreate(BaseModel):
    order_id: int
    due_date: datetime
    notes: str | None = None


class InvoiceRead(InvoiceCreate):
    id: int
    buyer_id: int
    supplier_id: int
    company_id: int
    amount: float
    currency: str
    status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
