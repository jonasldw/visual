from typing import Optional, List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from supabase import Client
from app.database import get_database
from app.models.customer import (
    Customer,
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse,
    CustomerStatus
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/customers", response_model=CustomerListResponse)
async def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    status: Optional[CustomerStatus] = Query(None, description="Filter by status"),
    insurance_type: Optional[str] = Query(None, description="Filter by insurance type"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Client = Depends(get_database)
) -> CustomerListResponse:
    """
    List customers with pagination, filtering, and sorting.
    
    - **page**: Page number (starts at 1)
    - **per_page**: Number of items per page (max 100)
    - **search**: Search in first_name, last_name, or email
    - **status**: Filter by customer status
    - **insurance_type**: Filter by insurance type
    - **sort_by**: Field to sort by (created_at, last_name, last_exam_date, next_appointment)
    - **sort_order**: Sort order (asc or desc)
    """
    try:
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Build query
        query = db.table('customers').select('*')
        
        # Apply filters
        if search:
            # Search in name and email fields
            search_pattern = f"%{search}%"
            query = query.or_(
                f"first_name.ilike.{search_pattern},"
                f"last_name.ilike.{search_pattern},"
                f"email.ilike.{search_pattern}"
            )
        
        if status:
            query = query.eq('status', status.value)
        
        if insurance_type:
            query = query.eq('insurance_type', insurance_type)
        
        # Apply sorting
        valid_sort_fields = ['created_at', 'last_name', 'first_name', 'last_exam_date', 'next_appointment']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
        
        query = query.order(sort_by, desc=(sort_order == 'desc'))
        
        query = query.range(offset, offset + per_page - 1)
        
        result = query.execute()
        
        query = db.table('customers').select('*', count='exact')
        
        if search:
            query = query.or_(
                f"first_name.ilike.{search_pattern},"
                f"last_name.ilike.{search_pattern},"
                f"email.ilike.{search_pattern}"
            )
        if status:
            query = query.eq('status', status.value)
        if insurance_type:
            query = query.eq('insurance_type', insurance_type)
        
        query = query.order(sort_by, desc=(sort_order == 'desc'))
        query = query.range(offset, offset + per_page - 1)
        
        result = query.execute()
        total = result.count if result.count else 0
        
        # Convert to Pydantic models
        customers = [Customer(**row) for row in result.data]
        
        # Calculate pagination metadata
        total_pages = (total + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return CustomerListResponse(
            customers=customers,
            total=total,
            page=page,
            per_page=per_page,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        logger.error(f"Error listing customers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/customers", response_model=CustomerResponse, status_code=201)
async def create_customer(
    customer: CustomerCreate,
    db: Client = Depends(get_database)
) -> CustomerResponse:
    """
    Create a new customer.
    """
    try:
        # Convert Pydantic model to dict for Supabase
        customer_data = customer.model_dump(exclude_unset=True)
        
        # Convert date/datetime objects to strings for JSON serialization
        for key, value in customer_data.items():
            if isinstance(value, datetime):
                customer_data[key] = value.isoformat()
            elif isinstance(value, date):
                customer_data[key] = value.isoformat()
        
        # Execute insert
        result = db.table('customers').insert(customer_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create customer")
        
        # Return created customer
        return Customer(**result.data[0])
        
    except Exception as e:
        logger.error(f"Error creating customer: {e}")
        if "duplicate key value" in str(e):
            raise HTTPException(status_code=409, detail="Customer with this email already exists")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int = Path(..., description="Customer ID"),
    db: Client = Depends(get_database)
) -> CustomerResponse:
    """
    Get a specific customer by ID.
    """
    try:
        result = db.table('customers').select('*').eq('id', customer_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        return Customer(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int = Path(..., description="Customer ID"),
    customer_update: CustomerUpdate = None,
    db: Client = Depends(get_database)
) -> CustomerResponse:
    """
    Update a customer's information.
    """
    try:
        # Check if customer exists
        existing = db.table('customers').select('id').eq('id', customer_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get update data (exclude unset fields)
        update_data = customer_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Convert date/datetime objects to strings for JSON serialization
        for key, value in update_data.items():
            if isinstance(value, datetime):
                update_data[key] = value.isoformat()
            elif isinstance(value, date):
                update_data[key] = value.isoformat()
        
        # Execute update
        result = db.table('customers').update(update_data).eq('id', customer_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update customer")
        
        return Customer(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating customer {customer_id}: {e}")
        if "duplicate key value" in str(e):
            raise HTTPException(status_code=409, detail="Customer with this email already exists")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/customers/{customer_id}", status_code=204)
async def delete_customer(
    customer_id: int = Path(..., description="Customer ID"),
    db: Client = Depends(get_database)
) -> None:
    """
    Soft delete a customer (archive).
    """
    try:
        # Check if customer exists
        existing = db.table('customers').select('id, status').eq('id', customer_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Soft delete by setting status to archived
        result = db.table('customers').update({
            'status': 'archiviert'  # Using the German enum value from the database
        }).eq('id', customer_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to archive customer")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting customer {customer_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")