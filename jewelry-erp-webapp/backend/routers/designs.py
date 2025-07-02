from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from ..database import get_db
from prisma import Prisma

router = APIRouter()

@router.get("/")
async def get_designs(
    active: Optional[bool] = Query(True),
    category: Optional[str] = Query(None),
    db: Prisma = Depends(get_db)
):
    """Get all designs"""
    try:
        where_clause = {}
        if active is not None:
            where_clause["active"] = active
        if category:
            where_clause["category"] = category
        
        designs = await db.design.find_many(
            where=where_clause,
            order={"name": "asc"}
        )
        
        return designs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))