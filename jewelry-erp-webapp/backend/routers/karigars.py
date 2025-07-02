from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from database import get_db
from prisma import Prisma

router = APIRouter()

@router.get("/")
async def get_karigars(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active: Optional[bool] = Query(True),
    db: Prisma = Depends(get_db)
):
    """Get all karigars"""
    try:
        where_clause = {}
        if active is not None:
            where_clause["active"] = active
        
        karigars = await db.karigar.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            order={"name": "asc"}
        )
        
        return karigars
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{karigar_id}")
async def get_karigar(karigar_id: str, db: Prisma = Depends(get_db)):
    """Get a specific karigar by ID"""
    try:
        karigar = await db.karigar.find_unique(
            where={"id": karigar_id},
            include={
                "issues": {"take": 10, "order": {"issueDate": "desc"}},
                "receipts": {"take": 10, "order": {"receiptDate": "desc"}}
            }
        )
        
        if not karigar:
            raise HTTPException(status_code=404, detail="Karigar not found")
        
        return karigar
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))