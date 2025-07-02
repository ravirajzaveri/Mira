from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio
import json

from ..database import get_db
from ..schemas.orders import (
    OrderCreate,
    OrderUpdate,
    OrderStatusUpdate,
    OrderResponse,
    OrderStatusHistoryResponse,
    OrderListResponse,
    OrderDashboard,
    OrderStatus,
    Location,
    ClientCategory,
    UrgencyLevel
)

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, db = Depends(get_db)):
    """Create a new order"""
    try:
        # Check if order number already exists
        existing_order = await db.order.find_unique(where={"orderNo": order.orderNo})
        if existing_order:
            raise HTTPException(status_code=400, detail="Order number already exists")
        
        # Create the order
        new_order = await db.order.create(
            data={
                "orderNo": order.orderNo,
                "bagNo": order.bagNo,
                "clientName": order.clientName,
                "clientCategory": order.clientCategory.value,
                "designNo": order.designNo,
                "description": order.description,
                "quantity": order.quantity,
                "stoneType": order.stoneType,
                "stoneSize": order.stoneSize,
                "stoneQuality": order.stoneQuality,
                "orderDate": order.orderDate or datetime.now(),
                "deliveryDate": order.deliveryDate,
                "urgencyLevel": order.urgencyLevel.value,
                "specialInstructions": order.specialInstructions,
                "imageUrls": order.imageUrls,
                "documentUrls": order.documentUrls,
                "currentStatus": OrderStatus.RECEIVED.value,
                "currentLocation": Location.HEAD_OFFICE.value,
                "progressPercentage": 0.0
            },
            include={
                "currentKarigar": True,
                "currentProcess": True
            }
        )
        
        # Create initial status history entry
        await db.orderstatushistory.create(
            data={
                "orderId": new_order.id,
                "newStatus": OrderStatus.RECEIVED.value,
                "location": Location.HEAD_OFFICE.value,
                "comments": "Order created and received",
                "changedBy": "System"
            }
        )
        
        return new_order
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.get("/", response_model=OrderListResponse)
async def get_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    client_category: Optional[str] = Query(None),
    urgency_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db = Depends(get_db)
):
    """Get paginated list of orders with filtering"""
    try:
        # Build where clause
        where_clause = {}
        
        if status:
            where_clause["currentStatus"] = status
        if location:
            where_clause["currentLocation"] = location
        if client_category:
            where_clause["clientCategory"] = client_category
        if urgency_level:
            where_clause["urgencyLevel"] = urgency_level
        if search:
            where_clause["OR"] = [
                {"orderNo": {"contains": search, "mode": "insensitive"}},
                {"clientName": {"contains": search, "mode": "insensitive"}},
                {"description": {"contains": search, "mode": "insensitive"}}
            ]
        
        # Get total count
        total = await db.order.count(where=where_clause)
        
        # Calculate pagination
        skip = (page - 1) * page_size
        total_pages = (total + page_size - 1) // page_size
        
        # Get orders
        orders = await db.order.find_many(
            where=where_clause,
            skip=skip,
            take=page_size,
            include={
                "currentKarigar": True,
                "currentProcess": True
            },
            order={"createdAt": "desc"}
        )
        
        return OrderListResponse(
            orders=orders,
            total=total,
            page=page,
            pageSize=page_size,
            totalPages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db = Depends(get_db)):
    """Get order by ID"""
    try:
        order = await db.order.find_unique(
            where={"id": order_id},
            include={
                "currentKarigar": True,
                "currentProcess": True,
                "statusHistory": {
                    "include": {
                        "karigar": True,
                        "process": True
                    },
                    "orderBy": {"statusDate": "desc"}
                },
                "jobCards": {
                    "include": {
                        "assignedKarigar": True,
                        "assignedProcess": True
                    }
                }
            }
        )
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: str, order_update: OrderUpdate, db = Depends(get_db)):
    """Update order details"""
    try:
        # Check if order exists
        existing_order = await db.order.find_unique(where={"id": order_id})
        if not existing_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Prepare update data
        update_data = {}
        for field, value in order_update.dict(exclude_unset=True).items():
            if value is not None:
                if field in ["clientCategory", "urgencyLevel"]:
                    update_data[field] = value.value if hasattr(value, 'value') else value
                else:
                    update_data[field] = value
        
        # Update the order
        updated_order = await db.order.update(
            where={"id": order_id},
            data=update_data,
            include={
                "currentKarigar": True,
                "currentProcess": True
            }
        )
        
        return updated_order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update order: {str(e)}")

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, db = Depends(get_db)):
    """Update order status and create history entry"""
    try:
        # Check if order exists
        existing_order = await db.order.find_unique(where={"id": order_id})
        if not existing_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Prepare update data
        update_data = {
            "currentStatus": status_update.newStatus.value,
            "currentLocation": status_update.location.value,
            "currentKarigarId": status_update.karigarId,
            "currentProcessId": status_update.processId
        }
        
        if status_update.progressPercentage is not None:
            update_data["progressPercentage"] = status_update.progressPercentage
        if status_update.estimatedCompletion is not None:
            update_data["estimatedCompletion"] = status_update.estimatedCompletion
        
        # Update order and create status history in a transaction
        async with db.tx() as transaction:
            # Update order
            updated_order = await transaction.order.update(
                where={"id": order_id},
                data=update_data,
                include={
                    "currentKarigar": True,
                    "currentProcess": True
                }
            )
            
            # Create status history entry
            await transaction.orderstatushistory.create(
                data={
                    "orderId": order_id,
                    "previousStatus": existing_order.currentStatus,
                    "newStatus": status_update.newStatus.value,
                    "location": status_update.location.value,
                    "karigarId": status_update.karigarId,
                    "processId": status_update.processId,
                    "comments": status_update.comments,
                    "changedBy": "User"  # TODO: Get from authentication context
                }
            )
        
        return updated_order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update order status: {str(e)}")

@router.get("/{order_id}/status-history", response_model=List[OrderStatusHistoryResponse])
async def get_order_status_history(order_id: str, db = Depends(get_db)):
    """Get order status history"""
    try:
        # Check if order exists
        existing_order = await db.order.find_unique(where={"id": order_id})
        if not existing_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get status history
        history = await db.orderstatushistory.find_many(
            where={"orderId": order_id},
            include={
                "karigar": True,
                "process": True
            },
            order={"statusDate": "desc"}
        )
        
        return history
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch status history: {str(e)}")

@router.delete("/{order_id}")
async def delete_order(order_id: str, db = Depends(get_db)):
    """Delete an order"""
    try:
        # Check if order exists
        existing_order = await db.order.find_unique(where={"id": order_id})
        if not existing_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check if order has associated job cards
        job_cards = await db.jobcard.count(where={"orderId": order_id})
        if job_cards > 0:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete order with associated job cards"
            )
        
        # Delete order and its status history
        async with db.tx() as transaction:
            # Delete status history first
            await transaction.orderstatushistory.delete_many(where={"orderId": order_id})
            
            # Delete order
            await transaction.order.delete(where={"id": order_id})
        
        return {"message": "Order deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete order: {str(e)}")

@router.get("/generate/number")
async def generate_order_number(db = Depends(get_db)):
    """Generate next available order number"""
    try:
        # Get current date
        today = datetime.now()
        date_prefix = today.strftime("ORD-%Y%m%d-")
        
        # Find the highest order number for today
        orders_today = await db.order.find_many(
            where={
                "orderNo": {
                    "startswith": date_prefix
                }
            },
            select={"orderNo": True},
            order={"orderNo": "desc"},
            take=1
        )
        
        if orders_today:
            # Extract the sequence number and increment
            last_order_no = orders_today[0].orderNo
            sequence = int(last_order_no.split("-")[-1]) + 1
        else:
            sequence = 1
        
        new_order_no = f"{date_prefix}{sequence:03d}"
        
        return {"orderNo": new_order_no}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate order number: {str(e)}")

@router.get("/dashboard/stats", response_model=OrderDashboard)
async def get_order_dashboard(db = Depends(get_db)):
    """Get order dashboard statistics"""
    try:
        # Get basic counts
        total_orders = await db.order.count()
        active_orders = await db.order.count(
            where={
                "currentStatus": {
                    "not_in": [OrderStatus.DELIVERED.value, OrderStatus.CANCELLED.value]
                }
            }
        )
        completed_orders = await db.order.count(
            where={"currentStatus": OrderStatus.DELIVERED.value}
        )
        on_hold_orders = await db.order.count(
            where={"currentStatus": OrderStatus.ON_HOLD.value}
        )
        
        # Get urgent orders
        urgent_orders = await db.order.count(
            where={
                "urgencyLevel": UrgencyLevel.URGENT.value,
                "currentStatus": {
                    "not_in": [OrderStatus.DELIVERED.value, OrderStatus.CANCELLED.value]
                }
            }
        )
        
        # Get delayed orders (delivery date passed and not delivered)
        today = datetime.now()
        delayed_orders = await db.order.count(
            where={
                "deliveryDate": {"lt": today},
                "currentStatus": {
                    "not_in": [OrderStatus.DELIVERED.value, OrderStatus.CANCELLED.value]
                }
            }
        )
        
        # Get status statistics
        status_stats = []
        for status in OrderStatus:
            count = await db.order.count(where={"currentStatus": status.value})
            percentage = (count / total_orders * 100) if total_orders > 0 else 0
            status_stats.append({
                "status": status.value,
                "count": count,
                "percentage": round(percentage, 2)
            })
        
        return OrderDashboard(
            totalOrders=total_orders,
            activeOrders=active_orders,
            completedOrders=completed_orders,
            onHoldOrders=on_hold_orders,
            statusStats=status_stats,
            urgentOrders=urgent_orders,
            delayedOrders=delayed_orders
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard stats: {str(e)}")