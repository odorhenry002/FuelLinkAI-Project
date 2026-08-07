"""
Configuration settings for FuelLink AI Backend

This module loads and validates configuration from environment variables.
"""

from typing import Optional

from pydantic import ConfigDict, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Server Configuration
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./fuellink.db"
    DATABASE_ECHO: bool = False

    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = None

    # Email Configuration
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SENDER_EMAIL: Optional[str] = None
    SENDER_PASSWORD: Optional[str] = None

    # Google Maps Configuration
    GOOGLE_MAPS_API_KEY: Optional[str] = None

    # AWS Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: Optional[str] = None

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = ConfigDict(env_file=".env", case_sensitive=True, extra="allow")

    @model_validator(mode="after")
    def validate_runtime_security(self):
        env_name = self.ENVIRONMENT.lower()

        if env_name == "production":
            insecure_secrets = {
                "your-secret-key-change-in-production",
                "change-me",
                "dev-secret",
                "secret",
            }
            if self.SECRET_KEY in insecure_secrets or len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY must be set to a secure value in production.")
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("Production environment cannot use SQLite. Use PostgreSQL.")

        return self

    @property
    def allowed_origins_list(self) -> list:
        """Parse ALLOWED_ORIGINS string into a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Create settings instance
settings = Settings()
