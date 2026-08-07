# Models Package
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    future=True
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)

# Base class for all models
Base = declarative_base()

# Import all models so they are registered with SQLAlchemy metadata
from app.models.user import User  # noqa: F401
from app.models.company import Company  # noqa: F401
from app.models.rfq import RFQ  # noqa: F401
from app.models.quote import Quote  # noqa: F401

# Dependency to get database session
def get_db():
    """Dependency function to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
