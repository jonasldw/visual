from fastapi import APIRouter, Depends
from supabase import Client
from app.database import supabase_client, get_database
from app.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "Visual CRM API",
        "version": settings.PROJECT_VERSION
    }

@router.get("/health/database")
async def database_health_check():
    """Database connectivity health check"""
    try:
        health_result = await supabase_client.health_check()
        return {
            **health_result,
            "service": "Visual CRM API",
            "version": settings.PROJECT_VERSION
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "service": "Visual CRM API",
            "version": settings.PROJECT_VERSION
        }

@router.get("/health/detailed")
async def detailed_health_check():
    """Comprehensive health check with database and service status"""
    try:
        db_health = await supabase_client.health_check()
        
        return {
            "service": {
                "name": "Visual CRM API",
                "version": settings.PROJECT_VERSION,
                "status": "healthy"
            },
            "database": db_health,
            "environment": {
                "debug": settings.DEBUG,
                "host": settings.API_HOST,
                "port": settings.API_PORT
            },
            "overall_status": "healthy" if db_health["status"] == "healthy" else "degraded"
        }
    except Exception as e:
        return {
            "service": {
                "name": "Visual CRM API", 
                "version": settings.PROJECT_VERSION,
                "status": "unhealthy"
            },
            "database": {
                "status": "unhealthy",
                "error": str(e)
            },
            "overall_status": "unhealthy"
        }