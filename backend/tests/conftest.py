from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.models import Base, get_db

TEST_DB_FILE = Path(__file__).resolve().parent / "test.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    future=True,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    if TEST_DB_FILE.exists():
        TEST_DB_FILE.unlink()

    Base.metadata.create_all(bind=engine)
    yield

    engine.dispose()
    if TEST_DB_FILE.exists():
        TEST_DB_FILE.unlink()


@pytest.fixture(scope="function")
def client(setup_database):
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
