from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.models import Base


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    price_per_unit = Column(Numeric(12, 2), nullable=False)
    total_amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String(10), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="submitted", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    rfq = relationship("RFQ", back_populates="quotes")
    supplier = relationship("User", foreign_keys=[supplier_id], back_populates="quotes")
    company = relationship("Company", back_populates="quotes")
