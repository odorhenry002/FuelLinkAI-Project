from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    transporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    vehicle_number = Column(String(80), nullable=False)
    route = Column(String(255), nullable=False)
    eta = Column(DateTime, nullable=False)
    status = Column(String(50), default="assigned", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="deliveries")
    transporter = relationship("User", foreign_keys=[transporter_id], back_populates="deliveries")
    company = relationship("Company", back_populates="deliveries")
