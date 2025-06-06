from fastapi import Depends
from supabase import Client
from app.database import get_supabase_client

def get_db() -> Client:
    """Dependency to get database client"""
    return get_supabase_client()