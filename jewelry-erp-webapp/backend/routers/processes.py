from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from ..database import get_db
from prisma import Prisma

router = APIRouter()

@router.get("/")
async def get_processes(
    active: Optional[bool] = Query(True),
    db: Prisma = Depends(get_db)
):
    """Get all processes"""
    try:
        where_clause = {}
        if active is not None:
            where_clause["active"] = active
        
        processes = await db.process.find_many(
            where=where_clause,
            order={"name": "asc"}
        )
        
        return processes
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))