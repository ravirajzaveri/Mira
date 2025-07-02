from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReceiptBase(BaseModel):
    receipt_no: str = Field(..., description="Unique receipt number")
    receipt_date: datetime = Field(default_factory=datetime.now)
    issue_id: str = Field(..., description="Issue ID")
    pieces: int = Field(default=0, ge=0)
    gross_weight: float = Field(default=0, ge=0)
    stone_weight: float = Field(default=0, ge=0)
    wastage_weight: float = Field(default=0, ge=0)
    remarks: Optional[str] = Field(None, description="Additional remarks")

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptUpdate(BaseModel):
    receipt_no: Optional[str] = None
    receipt_date: Optional[datetime] = None
    issue_id: Optional[str] = None
    karigar_id: Optional[str] = None
    pieces: Optional[int] = None
    gross_weight: Optional[float] = None
    stone_weight: Optional[float] = None
    wastage_weight: Optional[float] = None
    net_weight: Optional[float] = None
    remarks: Optional[str] = None

class ReceiptResponse(ReceiptBase):
    id: str
    karigar_id: str
    net_weight: float
    created_at: datetime
    updated_at: datetime
    issue: Optional[dict] = None
    karigar: Optional[dict] = None

    class Config:
        from_attributes = True