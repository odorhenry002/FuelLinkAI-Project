from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.models import Base


class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(120), nullable=False, index=True)
    quantity = Column(Numeric(12, 2), nullable=False)
    unit = Column(String(50), nullable=False)
    delivery_location = Column(String(255), nullable=False)
    currency = Column(String(10), nullable=False)
    status = Column(String(50), default="open", nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="rfqs")
    company = relationship("Company", back_populates="rfqs")
    quotes = relationship("Quote", back_populates="rfq", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="rfq", cascade="all, delete-orphan")
