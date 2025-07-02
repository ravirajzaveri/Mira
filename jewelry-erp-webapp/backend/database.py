from prisma import Prisma
import asyncio

# Global database instance
db = Prisma()

async def connect_db():
    """Connect to the database"""
    await db.connect()
    print("Database connected successfully")

async def disconnect_db():
    """Disconnect from the database"""
    await db.disconnect()
    print("Database disconnected")

async def get_db():
    """Dependency to get database instance"""
    return db