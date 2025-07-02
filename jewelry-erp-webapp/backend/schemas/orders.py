from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ClientCategory(str, Enum):
    SAMPLE = "SAMPLE"
    ONLINE = "ONLINE"
    RETAIL = "RETAIL"
    WHOLESALE = "WHOLESALE"

class UrgencyLevel(str, Enum):
    NORMAL = "NORMAL"
    URGENT = "URGENT"
    RUSH = "RUSH"

class OrderStatus(str, Enum):
    # Head Office Stages
    RECEIVED = "RECEIVED"
    DESIGN_PENDING = "DESIGN_PENDING"
    DESIGN_APPROVED = "DESIGN_APPROVED"
    CAD_PENDING = "CAD_PENDING"
    CAD_COMPLETED = "CAD_COMPLETED"
    CAM_PENDING = "CAM_PENDING"
    CAM_COMPLETED = "CAM_COMPLETED"
    WAX_PENDING = "WAX_PENDING"
    WAX_COMPLETED = "WAX_COMPLETED"
    
    # Dispatch Stages
    DISPATCHED_TO_FACTORY = "DISPATCHED_TO_FACTORY"
    RECEIVED_AT_FACTORY = "RECEIVED_AT_FACTORY"
    
    # Factory Production Stages
    MATERIAL_ISSUED = "MATERIAL_ISSUED"
    IN_PRODUCTION = "IN_PRODUCTION"
    CASTING_PENDING = "CASTING_PENDING"
    CASTING_COMPLETED = "CASTING_COMPLETED"
    FILING_PENDING = "FILING_PENDING"
    FILING_COMPLETED = "FILING_COMPLETED"
    POLISHING_PENDING = "POLISHING_PENDING"
    POLISHING_COMPLETED = "POLISHING_COMPLETED"
    STONE_SETTING_PENDING = "STONE_SETTING_PENDING"
    STONE_SETTING_COMPLETED = "STONE_SETTING_COMPLETED"
    QUALITY_CHECK_PENDING = "QUALITY_CHECK_PENDING"
    QUALITY_APPROVED = "QUALITY_APPROVED"
    PRODUCTION_COMPLETED = "PRODUCTION_COMPLETED"
    
    # Return Journey
    DISPATCHED_TO_HEAD_OFFICE = "DISPATCHED_TO_HEAD_OFFICE"
    RECEIVED_AT_HEAD_OFFICE = "RECEIVED_AT_HEAD_OFFICE"
    FINAL_INSPECTION = "FINAL_INSPECTION"
    READY_FOR_DELIVERY = "READY_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    
    # Exception Handling
    ON_HOLD = "ON_HOLD"
    REWORK_REQUIRED = "REWORK_REQUIRED"
    CANCELLED = "CANCELLED"

class Location(str, Enum):
    HEAD_OFFICE = "HEAD_OFFICE"
    FACTORY = "FACTORY"
    KARIGAR = "KARIGAR"

class OrderCreate(BaseModel):
    orderNo: str = Field(..., description="Unique order number")
    bagNo: Optional[str] = Field(None, description="Alternative reference number")
    clientName: str = Field(..., description="Customer name")
    clientCategory: ClientCategory = Field(ClientCategory.RETAIL, description="Customer category")
    
    # Product Details
    designNo: Optional[str] = Field(None, description="Design catalog reference")
    description: Optional[str] = Field(None, description="Product description")
    quantity: int = Field(1, ge=1, description="Order quantity")
    
    # Stone Specifications
    stoneType: Optional[str] = Field(None, description="Stone type (DIAMOND, RUBY, etc.)")
    stoneSize: Optional[str] = Field(None, description="Stone size/dimensions")
    stoneQuality: Optional[str] = Field(None, description="Stone grade/quality")
    
    # Timeline & Delivery
    orderDate: Optional[datetime] = Field(None, description="Order date")
    deliveryDate: Optional[datetime] = Field(None, description="Expected delivery date")
    urgencyLevel: UrgencyLevel = Field(UrgencyLevel.NORMAL, description="Priority level")
    
    # Special Requirements
    specialInstructions: Optional[str] = Field(None, description="Special requirements")
    
    # Images & Documents
    imageUrls: List[str] = Field(default_factory=list, description="Product images")
    documentUrls: List[str] = Field(default_factory=list, description="Related documents")

class OrderUpdate(BaseModel):
    bagNo: Optional[str] = None
    clientName: Optional[str] = None
    clientCategory: Optional[ClientCategory] = None
    designNo: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=1)
    stoneType: Optional[str] = None
    stoneSize: Optional[str] = None
    stoneQuality: Optional[str] = None
    deliveryDate: Optional[datetime] = None
    urgencyLevel: Optional[UrgencyLevel] = None
    specialInstructions: Optional[str] = None
    imageUrls: Optional[List[str]] = None
    documentUrls: Optional[List[str]] = None

class OrderStatusUpdate(BaseModel):
    newStatus: OrderStatus = Field(..., description="New order status")
    location: Location = Field(..., description="Current location")
    karigarId: Optional[str] = Field(None, description="Current karigar if applicable")
    processId: Optional[str] = Field(None, description="Current process if applicable")
    comments: Optional[str] = Field(None, description="Status change comments")
    progressPercentage: Optional[float] = Field(None, ge=0, le=100, description="Progress percentage")
    estimatedCompletion: Optional[datetime] = Field(None, description="Estimated completion date")

class OrderResponse(BaseModel):
    id: str
    orderNo: str
    bagNo: Optional[str]
    clientName: str
    clientCategory: str
    designNo: Optional[str]
    description: Optional[str]
    quantity: int
    stoneType: Optional[str]
    stoneSize: Optional[str]
    stoneQuality: Optional[str]
    orderDate: datetime
    deliveryDate: Optional[datetime]
    urgencyLevel: str
    specialInstructions: Optional[str]
    currentStatus: str
    currentLocation: str
    currentKarigarId: Optional[str]
    currentProcessId: Optional[str]
    progressPercentage: float
    estimatedCompletion: Optional[datetime]
    imageUrls: List[str]
    documentUrls: List[str]
    createdAt: datetime
    updatedAt: datetime
    
    # Related data
    currentKarigar: Optional[dict] = None
    currentProcess: Optional[dict] = None

class OrderStatusHistoryResponse(BaseModel):
    id: str
    orderId: str
    previousStatus: Optional[str]
    newStatus: str
    location: str
    karigarId: Optional[str]
    processId: Optional[str]
    statusDate: datetime
    comments: Optional[str]
    changedBy: Optional[str]
    
    # Related data
    karigar: Optional[dict] = None
    process: Optional[dict] = None

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int

class OrderStatusStats(BaseModel):
    status: str
    count: int
    percentage: float

class OrderDashboard(BaseModel):
    totalOrders: int
    activeOrders: int
    completedOrders: int
    onHoldOrders: int
    statusStats: List[OrderStatusStats]
    urgentOrders: int
    delayedOrders: int