from typing import Optional, List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from supabase import Client
from app.database import get_database
from app.models.product import (
    Product,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductType
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/products", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, brand, model, or SKU"),
    product_type: Optional[ProductType] = Query(None, description="Filter by product type"),
    active_only: bool = Query(True, description="Only return active products"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> ProductListResponse:
    """
    List products with pagination, filtering, and sorting.
    
    - **page**: Page number (starts at 1)
    - **per_page**: Number of items per page (max 100)
    - **search**: Search in name, brand, model, or SKU
    - **product_type**: Filter by product type (frame, lens, contact_lens, accessory)
    - **active_only**: Only show active products
    - **sort_by**: Field to sort by (created_at, name, brand, current_price)
    - **sort_order**: Sort order (asc or desc)
    - **organization_id**: Organization ID for multi-tenancy
    """
    try:
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Build query
        query = db.table('products').select('*').eq('organization_id', organization_id)
        
        # Apply filters
        if search:
            # Search in name, brand, model, and SKU fields
            search_pattern = f"%{search}%"
            query = query.or_(
                f"name.ilike.{search_pattern},"
                f"brand.ilike.{search_pattern},"
                f"model.ilike.{search_pattern},"
                f"sku.ilike.{search_pattern}"
            )
        
        if product_type:
            query = query.eq('product_type', product_type.value)
        
        if active_only:
            query = query.eq('active', True)
        
        # Apply sorting
        valid_sort_fields = ['created_at', 'name', 'brand', 'current_price', 'product_type']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
        
        query = query.order(sort_by, desc=(sort_order == 'desc'))
        
        # Get total count for pagination
        count_query = db.table('products').select('id', count='exact').eq('organization_id', organization_id)
        if search:
            count_query = count_query.or_(
                f"name.ilike.{search_pattern},"
                f"brand.ilike.{search_pattern},"
                f"model.ilike.{search_pattern},"
                f"sku.ilike.{search_pattern}"
            )
        if product_type:
            count_query = count_query.eq('product_type', product_type.value)
        if active_only:
            count_query = count_query.eq('active', True)
        
        count_result = count_query.execute()
        total = count_result.count if count_result.count else 0
        
        # Apply pagination
        query = query.range(offset, offset + per_page - 1)
        
        # Execute query
        result = query.execute()
        
        # Convert to Pydantic models
        products = [Product(**row) for row in result.data]
        
        # Calculate pagination metadata
        total_pages = (total + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return ProductListResponse(
            products=products,
            total=total,
            page=page,
            per_page=per_page,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        logger.error(f"Error listing products: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    product: ProductCreate,
    db: Client = Depends(get_database)
) -> ProductResponse:
    """
    Create a new product.
    """
    try:
        # Convert Pydantic model to dict for Supabase
        product_data = product.model_dump(exclude_unset=True)
        
        # Convert enum to string value
        if 'product_type' in product_data:
            product_data['product_type'] = product_data['product_type'].value
        
        # Convert Decimal to float for JSON serialization
        if 'current_price' in product_data:
            product_data['current_price'] = float(product_data['current_price'])
        if 'vat_rate' in product_data:
            product_data['vat_rate'] = float(product_data['vat_rate'])
        
        # Execute insert
        result = db.table('products').insert(product_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create product")
        
        # Return created product
        return Product(**result.data[0])
        
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        if "duplicate key value" in str(e):
            raise HTTPException(status_code=409, detail="Product with this SKU already exists")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int = Path(..., description="Product ID"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> ProductResponse:
    """
    Get a specific product by ID.
    """
    try:
        result = db.table('products').select('*').eq('id', product_id).eq('organization_id', organization_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return Product(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_update: ProductUpdate,
    product_id: int = Path(..., description="Product ID"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> ProductResponse:
    """
    Update a product's information.
    """
    try:
        # Check if product exists
        existing = db.table('products').select('id').eq('id', product_id).eq('organization_id', organization_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get update data (exclude unset fields)
        update_data = product_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Convert enum to string value
        if 'product_type' in update_data and update_data['product_type']:
            update_data['product_type'] = update_data['product_type'].value
        
        # Convert Decimal to float for JSON serialization
        if 'current_price' in update_data and update_data['current_price']:
            update_data['current_price'] = float(update_data['current_price'])
        if 'vat_rate' in update_data and update_data['vat_rate']:
            update_data['vat_rate'] = float(update_data['vat_rate'])
        
        # Execute update
        result = db.table('products').update(update_data).eq('id', product_id).eq('organization_id', organization_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update product")
        
        return Product(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        if "duplicate key value" in str(e):
            raise HTTPException(status_code=409, detail="Product with this SKU already exists")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(
    product_id: int = Path(..., description="Product ID"),
    organization_id: int = Query(1, description="Organization ID"),
    db: Client = Depends(get_database)
) -> None:
    """
    Soft delete a product (set active to false).
    """
    try:
        # Check if product exists
        existing = db.table('products').select('id, active').eq('id', product_id).eq('organization_id', organization_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Soft delete by setting active to false
        result = db.table('products').update({
            'active': False
        }).eq('id', product_id).eq('organization_id', organization_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to deactivate product")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")