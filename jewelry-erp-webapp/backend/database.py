from prisma import Prisma
import asyncio
import os

# Global database instance
db = Prisma()

async def connect_db():
    """Connect to the Neon database"""
    try:
        await db.connect()
        print("✅ Connected to Neon PostgreSQL database successfully")
    except Exception as e:
        print(f"❌ Failed to connect to Neon database: {e}")
        raise

async def disconnect_db():
    """Disconnect from the database"""
    try:
        await db.disconnect()
        print("✅ Disconnected from Neon database")
    except Exception as e:
        print(f"❌ Error disconnecting from database: {e}")

async def get_db():
    """Dependency to get database instance"""
    return db

async def check_db_connection():
    """Check if database connection is healthy"""
    try:
        # Simple query to test connection
        await db.query_raw("SELECT 1")
        return True
    except Exception as e:
        print(f"❌ Database health check failed: {e}")
        return False