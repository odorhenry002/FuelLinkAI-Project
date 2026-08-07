"""
FuelLink AI Backend - FastAPI Application Entry Point

This is the main application file that initializes FastAPI,
configures middleware, and sets up all routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import Base, engine
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.dashboard import router as dashboard_router
from app.routers.companies import router as companies_router
from app.routers.rfqs import router as rfq_router

# Create FastAPI application
app = FastAPI(
    title="FuelLink AI API",
    description="Africa's First AI-Powered Energy Marketplace",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(dashboard_router)
app.include_router(companies_router)
app.include_router(rfq_router)


@app.on_event("startup")
def create_database_tables():
    """Create database tables on startup if they do not exist."""
    Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    """Root endpoint - health check"""
    return {
        "message": "FuelLink AI API is running",
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"  # TODO: Implement actual DB health check
    }


# TODO: Add routers here
# app.include_router(auth_router)
# app.include_router(users_router)
# app.include_router(companies_router)
# etc.


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
