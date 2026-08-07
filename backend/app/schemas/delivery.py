from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DeliveryCreate(BaseModel):
    order_id: int
    vehicle_number: str = Field(..., min_length=1, max_length=80)
    route: str = Field(..., min_length=1, max_length=255)
    eta: datetime
    notes: str | None = None


class DeliveryRead(DeliveryCreate):
    id: int
    transporter_id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
