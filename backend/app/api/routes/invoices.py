from typing import Optional, List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from supabase import Client
from app.database import get_database
from app.models.invoice import (
    Invoice,
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceListResponse,
    InvoiceStatus,
    InvoiceItem,
    InvoiceItemCreate,
    InvoiceItemUpdate,
    InvoiceWithItems
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/invoices", response_model=InvoiceListResponse)
async def list_invoices(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by invoice number or customer name"),
    status: Optional[InvoiceStatus] = Query(None, description="Filter by invoice status"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> InvoiceListResponse:
    """
    List invoices with pagination, filtering, and sorting.
    
    - **page**: Page number (starts at 1)
    - **per_page**: Number of items per page (max 100)
    - **search**: Search in invoice number or customer data
    - **status**: Filter by invoice status
    - **customer_id**: Filter by specific customer
    - **date_from/date_to**: Filter by invoice date range
    - **sort_by**: Field to sort by (created_at, invoice_date, total)
    - **sort_order**: Sort order (asc or desc)
    - **organization_id**: Organization ID for multi-tenancy
    """
    try:
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Build query with customer join for search
        query = db.table('invoices').select(
            'id, organization_id, customer_id, invoice_number, invoice_date, due_date, '
            'prescription_snapshot, insurance_provider, insurance_claim_number, '
            'insurance_coverage_amount, patient_copay_amount, subtotal, vat_amount, '
            'total, status, payment_method, notes, created_at, updated_at, '
            'customers(first_name, last_name, email)'
        ).eq('organization_id', organization_id)
        
        # Apply filters
        if search:
            # Note: This is a simplified search. For more complex customer name search,
            # you might need to use a different approach or raw SQL
            search_pattern = f"%{search}%"
            query = query.ilike('invoice_number', search_pattern)
        
        if status:
            query = query.eq('status', status.value)
        
        if customer_id:
            query = query.eq('customer_id', customer_id)
        
        if date_from:
            query = query.gte('invoice_date', date_from)
        
        if date_to:
            query = query.lte('invoice_date', date_to)
        
        # Apply sorting
        valid_sort_fields = ['created_at', 'invoice_date', 'total', 'invoice_number']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
        
        query = query.order(sort_by, desc=(sort_order == 'desc'))
        
        # Get total count for pagination
        count_query = db.table('invoices').select('id', count='exact').eq('organization_id', organization_id)
        if search:
            count_query = count_query.ilike('invoice_number', search_pattern)
        if status:
            count_query = count_query.eq('status', status.value)
        if customer_id:
            count_query = count_query.eq('customer_id', customer_id)
        if date_from:
            count_query = count_query.gte('invoice_date', date_from)
        if date_to:
            count_query = count_query.lte('invoice_date', date_to)
        
        count_result = count_query.execute()
        total = count_result.count if count_result.count else 0
        
        # Apply pagination
        query = query.range(offset, offset + per_page - 1)
        
        # Execute query
        result = query.execute()
        
        # Convert to Pydantic models (flatten customer data)
        invoices = []
        for row in result.data:
            # Remove nested customer data for Invoice model compatibility
            invoice_data = {k: v for k, v in row.items() if k != 'customers'}
            invoices.append(Invoice(**invoice_data))
        
        # Calculate pagination metadata
        total_pages = (total + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return InvoiceListResponse(
            invoices=invoices,
            total=total,
            page=page,
            per_page=per_page,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        logger.error(f"Error listing invoices: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/invoices", response_model=InvoiceResponse, status_code=201)
async def create_invoice(
    invoice: InvoiceCreate,
    db: Client = Depends(get_database)
) -> InvoiceResponse:
    """
    Create a new invoice with optional items.
    """
    try:
        # Convert Pydantic model to dict for Supabase
        invoice_data = invoice.model_dump(exclude_unset=True, exclude={'items'})
        
        # Convert enum to string value
        if 'status' in invoice_data:
            invoice_data['status'] = invoice_data['status'].value
        
        # Convert date objects to strings
        for key, value in invoice_data.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                invoice_data[key] = value.isoformat()
        
        # Convert Decimal to float for JSON serialization
        decimal_fields = ['insurance_coverage_amount', 'patient_copay_amount']
        for field in decimal_fields:
            if field in invoice_data and invoice_data[field]:
                invoice_data[field] = float(invoice_data[field])
        
        # Execute insert (invoice_number will be auto-generated by trigger)
        result = db.table('invoices').insert(invoice_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create invoice")
        
        created_invoice = result.data[0]
        invoice_id = created_invoice['id']
        
        # Add items if provided
        items = []
        if invoice.items:
            for item in invoice.items:
                item_data = item.model_dump(exclude_unset=True)
                item_data['invoice_id'] = invoice_id
                
                # Convert Decimal to float
                decimal_fields = ['unit_price', 'discount_amount', 'vat_rate', 'line_total']
                for field in decimal_fields:
                    if field in item_data and item_data[field]:
                        item_data[field] = float(item_data[field])
                
                item_result = db.table('invoice_items').insert(item_data).execute()
                if item_result.data:
                    items.append(InvoiceItem(**item_result.data[0]))
        
        # Return created invoice with items
        invoice_obj = Invoice(**created_invoice)
        return InvoiceWithItems(**invoice_obj.model_dump(), items=items)
        
    except Exception as e:
        logger.error(f"Error creating invoice: {e}")
        if "violates foreign key constraint" in str(e):
            raise HTTPException(status_code=400, detail="Customer not found")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int = Path(..., description="Invoice ID"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> InvoiceResponse:
    """
    Get a specific invoice by ID with its items.
    """
    try:
        # Get invoice
        invoice_result = db.table('invoices').select('*').eq('id', invoice_id).eq('organization_id', organization_id).execute()
        
        if not invoice_result.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get invoice items
        items_result = db.table('invoice_items').select('*').eq('invoice_id', invoice_id).execute()
        items = [InvoiceItem(**item) for item in items_result.data]
        
        # Return invoice with items
        invoice_obj = Invoice(**invoice_result.data[0])
        return InvoiceWithItems(**invoice_obj.model_dump(), items=items)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting invoice {invoice_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int = Path(..., description="Invoice ID"),
    invoice_update: InvoiceUpdate,
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> InvoiceResponse:
    """
    Update an invoice's information.
    """
    try:
        # Check if invoice exists
        existing = db.table('invoices').select('id').eq('id', invoice_id).eq('organization_id', organization_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get update data (exclude unset fields)
        update_data = invoice_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Convert enum to string value
        if 'status' in update_data and update_data['status']:
            update_data['status'] = update_data['status'].value
        
        # Convert date objects to strings
        for key, value in update_data.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                update_data[key] = value.isoformat()
        
        # Convert Decimal to float for JSON serialization
        decimal_fields = ['insurance_coverage_amount', 'patient_copay_amount']
        for field in decimal_fields:
            if field in update_data and update_data[field]:
                update_data[field] = float(update_data[field])
        
        # Execute update
        result = db.table('invoices').update(update_data).eq('id', invoice_id).eq('organization_id', organization_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update invoice")
        
        # Get updated invoice with items
        items_result = db.table('invoice_items').select('*').eq('invoice_id', invoice_id).execute()
        items = [InvoiceItem(**item) for item in items_result.data]
        
        invoice_obj = Invoice(**result.data[0])
        return InvoiceWithItems(**invoice_obj.model_dump(), items=items)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invoice {invoice_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/invoices/{invoice_id}", status_code=204)
async def delete_invoice(
    invoice_id: int = Path(..., description="Invoice ID"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> None:
    """
    Delete an invoice (hard delete with cascade to items).
    """
    try:
        # Check if invoice exists
        existing = db.table('invoices').select('id').eq('id', invoice_id).eq('organization_id', organization_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Delete invoice (items will be cascade deleted by database)
        result = db.table('invoices').delete().eq('id', invoice_id).eq('organization_id', organization_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to delete invoice")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting invoice {invoice_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Invoice Items endpoints
@router.post("/invoices/{invoice_id}/items", response_model=InvoiceItem, status_code=201)
async def add_invoice_item(
    invoice_id: int = Path(..., description="Invoice ID"),
    item: InvoiceItemCreate = None,
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
):
    """
    Add an item to an existing invoice.
    """
    try:
        # Verify invoice exists and belongs to organization
        invoice_check = db.table('invoices').select('id').eq('id', invoice_id).eq('organization_id', organization_id).execute()
        if not invoice_check.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Prepare item data
        item_data = item.model_dump(exclude_unset=True)
        item_data['invoice_id'] = invoice_id
        
        # Convert Decimal to float
        decimal_fields = ['unit_price', 'discount_amount', 'vat_rate', 'line_total']
        for field in decimal_fields:
            if field in item_data and item_data[field]:
                item_data[field] = float(item_data[field])
        
        # Insert item
        result = db.table('invoice_items').insert(item_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to add invoice item")
        
        return InvoiceItem(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding item to invoice {invoice_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/invoices/{invoice_id}/items/{item_id}", response_model=InvoiceItem)
async def update_invoice_item(
    invoice_id: int = Path(..., description="Invoice ID"),
    item_id: int = Path(..., description="Item ID"),
    item_update: InvoiceItemUpdate = None,
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
):
    """
    Update an invoice item.
    """
    try:
        # Verify invoice exists and belongs to organization
        invoice_check = db.table('invoices').select('id').eq('id', invoice_id).eq('organization_id', organization_id).execute()
        if not invoice_check.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Check if item exists and belongs to invoice
        existing = db.table('invoice_items').select('id').eq('id', item_id).eq('invoice_id', invoice_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Invoice item not found")
        
        # Get update data
        update_data = item_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Convert Decimal to float
        decimal_fields = ['unit_price', 'discount_amount', 'vat_rate', 'line_total']
        for field in decimal_fields:
            if field in update_data and update_data[field]:
                update_data[field] = float(update_data[field])
        
        # Update item
        result = db.table('invoice_items').update(update_data).eq('id', item_id).eq('invoice_id', invoice_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update invoice item")
        
        return InvoiceItem(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invoice item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/invoices/{invoice_id}/items/{item_id}", status_code=204)
async def delete_invoice_item(
    invoice_id: int = Path(..., description="Invoice ID"),
    item_id: int = Path(..., description="Item ID"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
):
    """
    Delete an invoice item.
    """
    try:
        # Verify invoice exists and belongs to organization
        invoice_check = db.table('invoices').select('id').eq('id', invoice_id).eq('organization_id', organization_id).execute()
        if not invoice_check.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Check if item exists and belongs to invoice
        existing = db.table('invoice_items').select('id').eq('id', item_id).eq('invoice_id', invoice_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Invoice item not found")
        
        # Delete item
        result = db.table('invoice_items').delete().eq('id', item_id).eq('invoice_id', invoice_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to delete invoice item")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting invoice item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")