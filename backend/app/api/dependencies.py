from typing import AsyncGenerator
from fastapi import Depends
from supabase import Client
from app.database import get_database, supabase_client

async def get_db() -> AsyncGenerator[Client, None]:
    """Async dependency to get database client"""
    async for db in get_database():
        yield db

def get_db_sync() -> Client:
    """Synchronous dependency to get database client"""
    return supabase_client.client