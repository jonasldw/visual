import asyncio
from typing import AsyncGenerator, Optional
from supabase import create_client, Client
from supabase.client import ClientOptions
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Supabase database client singleton"""
    
    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None
    
    def __new__(cls) -> 'SupabaseClient':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize the Supabase client"""
        try:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
            
            # Configure client options for better performance
            options = ClientOptions(
                auto_refresh_token=True,
                persist_session=True,
                storage_key=f"supabase-{settings.PROJECT_NAME}",
                realtime={"timeout": 10000}
            )
            
            self._client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY,
                options=options
            )
            
            logger.info("Supabase client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    async def health_check(self) -> dict:
        """Check database connection health"""
        try:
            # Simple query to test connection
            result = self._client.table('customers').select('id').limit(1).execute()
            
            return {
                "status": "healthy",
                "database": "connected",
                "tables_accessible": True,
                "response_time_ms": getattr(result, 'response_time', 0)
            }
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "tables_accessible": False
            }
    
    def close(self) -> None:
        """Close the database connection"""
        if self._client:
            # Supabase client doesn't have explicit close method
            # but we can clear the instance
            self._client = None
            logger.info("Supabase client connection closed")


# Global instance
supabase_client = SupabaseClient()


async def get_database() -> AsyncGenerator[Client, None]:
    """Dependency to get database client for FastAPI"""
    try:
        yield supabase_client.client
    except Exception as e:
        logger.error(f"Database dependency error: {e}")
        raise


class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self, client: Client):
        self.client = client
    
    async def execute_query(self, query_builder):
        """Execute a query with error handling"""
        try:
            result = query_builder.execute()
            return result
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            raise
    
    async def create_tables(self) -> bool:
        """Create database tables if they don't exist"""
        try:
            # Read SQL schema file
            import os
            schema_path = os.path.join(
                os.path.dirname(__file__), 
                'schemas', 
                'customers.sql'
            )
            
            if os.path.exists(schema_path):
                with open(schema_path, 'r', encoding='utf-8') as f:
                    sql_commands = f.read()
                
                # Note: Supabase doesn't support direct SQL execution via Python client
                # Tables should be created via Supabase dashboard or CLI
                logger.info("Schema file found. Please run the SQL commands in Supabase dashboard.")
                return True
            else:
                logger.warning("Schema file not found")
                return False
                
        except Exception as e:
            logger.error(f"Failed to create tables: {e}")
            return False


async def init_database() -> None:
    """Initialize database connection and tables"""
    try:
        # Test connection
        health = await supabase_client.health_check()
        if health["status"] == "healthy":
            logger.info("Database initialized successfully")
        else:
            logger.error(f"Database initialization failed: {health}")
            
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise


async def close_database() -> None:
    """Close database connections"""
    try:
        supabase_client.close()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {e}")


# Legacy compatibility
def get_supabase_client() -> Client:
    """Dependency to get Supabase client instance (legacy)"""
    return supabase_client.client