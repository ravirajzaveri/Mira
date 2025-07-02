from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IssueBase(BaseModel):
    issue_no: str = Field(..., description="Unique issue number")
    issue_date: datetime = Field(default_factory=datetime.now)
    karigar_id: str = Field(..., description="Karigar ID")
    process_id: str = Field(..., description="Process ID")
    design_id: Optional[str] = Field(None, description="Design ID")
    pieces: int = Field(default=0, ge=0)
    gross_weight: float = Field(default=0, ge=0)
    stone_weight: float = Field(default=0, ge=0)
    net_weight: float = Field(default=0, ge=0)
    remarks: Optional[str] = Field(None, description="Additional remarks")

class IssueCreate(IssueBase):
    pass

class IssueUpdate(BaseModel):
    issue_no: Optional[str] = None
    issue_date: Optional[datetime] = None
    karigar_id: Optional[str] = None
    process_id: Optional[str] = None
    design_id: Optional[str] = None
    pieces: Optional[int] = None
    gross_weight: Optional[float] = None
    stone_weight: Optional[float] = None
    net_weight: Optional[float] = None
    remarks: Optional[str] = None
    status: Optional[str] = None

class IssueResponse(IssueBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    karigar: Optional[dict] = None
    process: Optional[dict] = None
    design: Optional[dict] = None

    class Config:
        from_attributes = True