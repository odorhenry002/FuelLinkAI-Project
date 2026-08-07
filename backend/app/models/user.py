from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(120), nullable=False)
    last_name = Column(String(120), nullable=False)
    phone = Column(String(32), nullable=True)
    role = Column(String(50), nullable=False, default="buyer")
    is_active = Column(Boolean, default=True, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="users")
