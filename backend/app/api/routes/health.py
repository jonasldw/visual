from fastapi import APIRouter, Depends
from supabase import Client
from app.api.dependencies import get_db

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "OptiCRM API",
        "version": "1.0.0"
    }

@router.get("/health/database")
async def database_health_check(db: Client = Depends(get_db)):
    """Database connectivity health check"""
    try:
        # Simple query to test database connectivity
        result = db.table('_health_check').select('*').limit(1).execute()
        return {
            "status": "healthy",
            "database": "connected",
            "service": "OptiCRM API"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "service": "OptiCRM API"
        }