from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from database import get_db
from schemas.receipt import ReceiptCreate, ReceiptUpdate, ReceiptResponse
from prisma import Prisma

router = APIRouter()

@router.post("/", response_model=ReceiptResponse)
async def create_receipt(receipt: ReceiptCreate, db: Prisma = Depends(get_db)):
    """Create a new receipt"""
    try:
        # Check if issue exists
        issue = await db.issue.find_unique(
            where={"id": receipt.issue_id},
            include={"receipts": True}
        )
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        # Calculate existing receipts total
        existing_receipts_total = sum(r.netWeight for r in issue.receipts)
        
        # Calculate net weight for new receipt
        net_weight = receipt.gross_weight - receipt.stone_weight - receipt.wastage_weight
        
        # Check if total receipts would exceed issue amount
        total_with_new = existing_receipts_total + net_weight
        if total_with_new > issue.netWeight * 1.01:  # Allow 1% tolerance
            raise HTTPException(
                status_code=400,
                detail=f"Receipt amount exceeds issue amount. "
                       f"Issue: {issue.netWeight}g, "
                       f"Already received: {existing_receipts_total}g, "
                       f"Trying to receive: {net_weight}g"
            )
        
        # Create receipt
        created_receipt = await db.receipt.create(
            data={
                "receiptNo": receipt.receipt_no,
                "receiptDate": receipt.receipt_date,
                "issueId": receipt.issue_id,
                "karigarId": issue.karigarId,
                "pieces": receipt.pieces,
                "grossWeight": receipt.gross_weight,
                "stoneWeight": receipt.stone_weight,
                "wastageWeight": receipt.wastage_weight,
                "netWeight": net_weight,
                "remarks": receipt.remarks
            },
            include={
                "issue": True,
                "karigar": True
            }
        )
        
        # Update issue status
        new_total = existing_receipts_total + net_weight
        if abs(new_total - issue.netWeight) < 0.001:
            new_status = "Completed"
        else:
            new_status = "Partial"
        
        await db.issue.update(
            where={"id": receipt.issue_id},
            data={"status": new_status}
        )
        
        # Create stock register entry
        await db.stockregister.create(
            data={
                "transactionType": "Receipt",
                "transactionId": created_receipt.id,
                "transactionDate": receipt.receipt_date,
                "grossWeightIn": receipt.gross_weight,
                "netWeightIn": net_weight
            }
        )
        
        return created_receipt
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[ReceiptResponse])
async def get_receipts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    issue_id: Optional[str] = Query(None),
    karigar_id: Optional[str] = Query(None),
    db: Prisma = Depends(get_db)
):
    """Get all receipts with optional filtering"""
    try:
        where_clause = {}
        
        if issue_id:
            where_clause["issueId"] = issue_id
        
        if karigar_id:
            where_clause["karigarId"] = karigar_id
        
        receipts = await db.receipt.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            include={
                "issue": True,
                "karigar": True
            },
            order={"receiptDate": "desc"}
        )
        
        return receipts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{receipt_id}", response_model=ReceiptResponse)
async def get_receipt(receipt_id: str, db: Prisma = Depends(get_db)):
    """Get a specific receipt by ID"""
    try:
        receipt = await db.receipt.find_unique(
            where={"id": receipt_id},
            include={
                "issue": True,
                "karigar": True
            }
        )
        
        if not receipt:
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        return receipt
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{receipt_id}", response_model=ReceiptResponse)
async def update_receipt(receipt_id: str, receipt_update: ReceiptUpdate, db: Prisma = Depends(get_db)):
    """Update an existing receipt"""
    try:
        # Check if receipt exists
        existing_receipt = await db.receipt.find_unique(where={"id": receipt_id})
        if not existing_receipt:
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        # Prepare update data
        update_data = {}
        for field, value in receipt_update.dict(exclude_unset=True).items():
            if field == "receipt_no":
                update_data["receiptNo"] = value
            elif field == "receipt_date":
                update_data["receiptDate"] = value
            elif field == "issue_id":
                update_data["issueId"] = value
            elif field == "karigar_id":
                update_data["karigarId"] = value
            elif field == "gross_weight":
                update_data["grossWeight"] = value
            elif field == "stone_weight":
                update_data["stoneWeight"] = value
            elif field == "wastage_weight":
                update_data["wastageWeight"] = value
            elif field == "net_weight":
                update_data["netWeight"] = value
            else:
                update_data[field] = value
        
        # Recalculate net weight if weights changed
        if any(key in update_data for key in ["grossWeight", "stoneWeight", "wastageWeight"]):
            gross_weight = update_data.get("grossWeight", existing_receipt.grossWeight)
            stone_weight = update_data.get("stoneWeight", existing_receipt.stoneWeight)
            wastage_weight = update_data.get("wastageWeight", existing_receipt.wastageWeight)
            update_data["netWeight"] = gross_weight - stone_weight - wastage_weight
        
        # Update receipt
        updated_receipt = await db.receipt.update(
            where={"id": receipt_id},
            data=update_data,
            include={
                "issue": True,
                "karigar": True
            }
        )
        
        return updated_receipt
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{receipt_id}")
async def delete_receipt(receipt_id: str, db: Prisma = Depends(get_db)):
    """Delete a receipt"""
    try:
        # Check if receipt exists
        receipt = await db.receipt.find_unique(where={"id": receipt_id})
        if not receipt:
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        # Delete the receipt
        await db.receipt.delete(where={"id": receipt_id})
        
        # Update issue status
        issue = await db.issue.find_unique(
            where={"id": receipt.issueId},
            include={"receipts": True}
        )
        
        if issue:
            total_received = sum(r.netWeight for r in issue.receipts)
            if total_received == 0:
                new_status = "Pending"
            elif abs(total_received - issue.netWeight) < 0.001:
                new_status = "Completed"
            else:
                new_status = "Partial"
            
            await db.issue.update(
                where={"id": receipt.issueId},
                data={"status": new_status}
            )
        
        return {"message": "Receipt deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/generate/number")
async def generate_receipt_number(db: Prisma = Depends(get_db)):
    """Generate a new receipt number"""
    try:
        today = datetime.now()
        date_str = today.strftime("%Y%m%d")
        prefix = f"RCP-{date_str}-"
        
        # Find the last receipt number for today
        last_receipt = await db.receipt.find_first(
            where={"receiptNo": {"startswith": prefix}},
            order={"receiptNo": "desc"}
        )
        
        if last_receipt:
            last_num = int(last_receipt.receiptNo.split("-")[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return {"receipt_number": f"{prefix}{new_num:03d}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/issue/{issue_id}/summary")
async def get_issue_receipt_summary(issue_id: str, db: Prisma = Depends(get_db)):
    """Get receipt summary for a specific issue"""
    try:
        issue = await db.issue.find_unique(
            where={"id": issue_id},
            include={"receipts": True}
        )
        
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        total_receipts = len(issue.receipts)
        total_gross_received = sum(r.grossWeight for r in issue.receipts)
        total_net_received = sum(r.netWeight for r in issue.receipts)
        total_wastage = sum(r.wastageWeight for r in issue.receipts)
        balance = issue.netWeight - total_net_received
        
        return {
            "issue_id": issue_id,
            "issue_net_weight": issue.netWeight,
            "total_receipts": total_receipts,
            "total_gross_received": total_gross_received,
            "total_net_received": total_net_received,
            "total_wastage": total_wastage,
            "balance": balance,
            "status": issue.status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))