from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.routes import health, customers, products, invoices
from app.database import init_database, close_database
import logging

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting Visual CRM API...")
    try:
        await init_database()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Continue startup even if database is not available
    
    yield
    
    # Shutdown
    logger.info("Shutting down Visual CRM API...")
    try:
        await close_database()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="FastAPI backend for Visual CRM - Optician Customer Relationship Management",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Configure CORS
# During development, allow all origins for easier local development
# In production, restrict to specific frontend URL once deployed
if settings.ENVIRONMENT == "production":
    allowed_origins = [settings.FRONTEND_URL]
else:
    # Development: allow localhost on any port
    allowed_origins = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    health.router,
    prefix=settings.API_V1_PREFIX,
    tags=["health"]
)

app.include_router(
    customers.router,
    prefix=settings.API_V1_PREFIX,
    tags=["customers"]
)

app.include_router(
    products.router,
    prefix=settings.API_V1_PREFIX,
    tags=["products"]
)

app.include_router(
    invoices.router,
    prefix=settings.API_V1_PREFIX,
    tags=["invoices"]
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Visual CRM API is running",
        "version": settings.PROJECT_VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )