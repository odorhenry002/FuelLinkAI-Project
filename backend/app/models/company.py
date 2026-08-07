from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.models import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(64), nullable=False)
    address = Column(String(512), nullable=False)
    city = Column(String(120), nullable=False)
    state = Column(String(120), nullable=False)
    country = Column(String(120), nullable=False)
    industry = Column(String(120), nullable=False)
    company_type = Column(String(80), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="company")
    rfqs = relationship("RFQ", back_populates="company")
    quotes = relationship("Quote", back_populates="company")
    orders = relationship("Order", back_populates="company")
