from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..schemas.issue import IssueCreate, IssueUpdate, IssueResponse
from prisma import Prisma

router = APIRouter()

@router.post("/", response_model=IssueResponse)
async def create_issue(issue: IssueCreate, db: Prisma = Depends(get_db)):
    """Create a new issue"""
    try:
        # Check if karigar exists
        karigar = await db.karigar.find_unique(where={"id": issue.karigar_id})
        if not karigar:
            raise HTTPException(status_code=404, detail="Karigar not found")
        
        # Check if process exists
        process = await db.process.find_unique(where={"id": issue.process_id})
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        # Check if design exists (if provided)
        if issue.design_id:
            design = await db.design.find_unique(where={"id": issue.design_id})
            if not design:
                raise HTTPException(status_code=404, detail="Design not found")
        
        # Calculate net weight
        net_weight = issue.gross_weight - issue.stone_weight
        
        # Create issue
        created_issue = await db.issue.create(
            data={
                "issueNo": issue.issue_no,
                "issueDate": issue.issue_date,
                "karigarId": issue.karigar_id,
                "processId": issue.process_id,
                "designId": issue.design_id,
                "pieces": issue.pieces,
                "grossWeight": issue.gross_weight,
                "stoneWeight": issue.stone_weight,
                "netWeight": net_weight,
                "remarks": issue.remarks,
                "status": "Pending"
            },
            include={
                "karigar": True,
                "process": True,
                "design": True
            }
        )
        
        # Create stock register entry
        await db.stockregister.create(
            data={
                "transactionType": "Issue",
                "transactionId": created_issue.id,
                "transactionDate": issue.issue_date,
                "grossWeightOut": issue.gross_weight,
                "netWeightOut": net_weight
            }
        )
        
        return created_issue
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[IssueResponse])
async def get_issues(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    karigar_id: Optional[str] = Query(None),
    db: Prisma = Depends(get_db)
):
    """Get all issues with optional filtering"""
    try:
        where_clause = {}
        
        if status:
            where_clause["status"] = status
        
        if karigar_id:
            where_clause["karigarId"] = karigar_id
        
        issues = await db.issue.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            include={
                "karigar": True,
                "process": True,
                "design": True
            },
            order={"issueDate": "desc"}
        )
        
        return issues
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: str, db: Prisma = Depends(get_db)):
    """Get a specific issue by ID"""
    try:
        issue = await db.issue.find_unique(
            where={"id": issue_id},
            include={
                "karigar": True,
                "process": True,
                "design": True,
                "receipts": True
            }
        )
        
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        return issue
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(issue_id: str, issue_update: IssueUpdate, db: Prisma = Depends(get_db)):
    """Update an existing issue"""
    try:
        # Check if issue exists
        existing_issue = await db.issue.find_unique(where={"id": issue_id})
        if not existing_issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        # Prepare update data
        update_data = {}
        for field, value in issue_update.dict(exclude_unset=True).items():
            if field == "karigar_id":
                update_data["karigarId"] = value
            elif field == "process_id":
                update_data["processId"] = value
            elif field == "design_id":
                update_data["designId"] = value
            elif field == "issue_no":
                update_data["issueNo"] = value
            elif field == "issue_date":
                update_data["issueDate"] = value
            elif field == "gross_weight":
                update_data["grossWeight"] = value
            elif field == "stone_weight":
                update_data["stoneWeight"] = value
            elif field == "net_weight":
                update_data["netWeight"] = value
            else:
                update_data[field] = value
        
        # Recalculate net weight if gross or stone weight changed
        if "grossWeight" in update_data or "stoneWeight" in update_data:
            gross_weight = update_data.get("grossWeight", existing_issue.grossWeight)
            stone_weight = update_data.get("stoneWeight", existing_issue.stoneWeight)
            update_data["netWeight"] = gross_weight - stone_weight
        
        # Update issue
        updated_issue = await db.issue.update(
            where={"id": issue_id},
            data=update_data,
            include={
                "karigar": True,
                "process": True,
                "design": True
            }
        )
        
        return updated_issue
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{issue_id}")
async def delete_issue(issue_id: str, db: Prisma = Depends(get_db)):
    """Delete an issue"""
    try:
        # Check if issue exists
        issue = await db.issue.find_unique(where={"id": issue_id})
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        # Check if there are any receipts against this issue
        receipts = await db.receipt.find_many(where={"issueId": issue_id})
        if receipts:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete issue with existing receipts"
            )
        
        # Delete the issue
        await db.issue.delete(where={"id": issue_id})
        
        return {"message": "Issue deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/generate/number")
async def generate_issue_number(db: Prisma = Depends(get_db)):
    """Generate a new issue number"""
    try:
        today = datetime.now()
        date_str = today.strftime("%Y%m%d")
        prefix = f"ISS-{date_str}-"
        
        # Find the last issue number for today
        last_issue = await db.issue.find_first(
            where={"issueNo": {"startswith": prefix}},
            order={"issueNo": "desc"}
        )
        
        if last_issue:
            last_num = int(last_issue.issueNo.split("-")[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return {"issue_number": f"{prefix}{new_num:03d}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pending/by-karigar/{karigar_id}")
async def get_pending_issues_by_karigar(karigar_id: str, db: Prisma = Depends(get_db)):
    """Get pending issues for a specific karigar"""
    try:
        issues = await db.issue.find_many(
            where={
                "karigarId": karigar_id,
                "status": {"in": ["Pending", "Partial"]}
            },
            include={
                "karigar": True,
                "process": True,
                "design": True
            },
            order={"issueDate": "desc"}
        )
        
        return issues
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))