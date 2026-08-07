from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.models import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    delivery_location = Column(String(255), nullable=False)
    total_amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String(10), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    rfq = relationship("RFQ", back_populates="orders")
    quote = relationship("Quote", back_populates="orders")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="purchased_orders")
    supplier = relationship("User", foreign_keys=[supplier_id], back_populates="sales_orders")
    company = relationship("Company", back_populates="orders")
    deliveries = relationship("Delivery", back_populates="order", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="order", cascade="all, delete-orphan")
