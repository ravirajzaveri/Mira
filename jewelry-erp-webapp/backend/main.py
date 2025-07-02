from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import os
from prisma import Prisma
from routers import issues, receipts, karigars, processes, designs, orders
from database import connect_db, disconnect_db

# Global Prisma client
db = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await disconnect_db()

app = FastAPI(
    title="Jewelry ERP API",
    description="Modern jewelry manufacturing management system API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router, tags=["orders"])
app.include_router(issues.router, prefix="/api/issues", tags=["issues"])
app.include_router(receipts.router, prefix="/api/receipts", tags=["receipts"])
app.include_router(karigars.router, prefix="/api/karigars", tags=["karigars"])
app.include_router(processes.router, prefix="/api/processes", tags=["processes"])
app.include_router(designs.router, prefix="/api/designs", tags=["designs"])

@app.get("/")
async def root():
    return {"message": "Jewelry ERP API is running"}

@app.get("/health")
async def health_check():
    try:
        from database import check_db_connection
        db_healthy = await check_db_connection()
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "provider": "Neon PostgreSQL"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "provider": "Neon PostgreSQL",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)