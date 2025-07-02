from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Jewelry ERP API",
    description="Modern jewelry manufacturing management system API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Jewelry ERP API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "not configured yet",
        "provider": "Neon PostgreSQL"
    }

# This is required for Vercel
handler = app