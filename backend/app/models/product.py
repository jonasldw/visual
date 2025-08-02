from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
from decimal import Decimal


class ProductType(str, Enum):
    FRAME = "frame"
    LENS = "lens"
    CONTACT_LENS = "contact_lens"
    ACCESSORY = "accessory"


class ProductBase(BaseModel):
    organization_id: int = Field(default=1, description="Organisation ID für Multi-Tenancy")
    product_type: ProductType = Field(..., description="Produkttyp")
    sku: Optional[str] = Field(None, max_length=50, description="Artikelnummer")
    name: str = Field(..., min_length=1, max_length=200, description="Produktname")
    brand: Optional[str] = Field(None, max_length=100, description="Marke")
    model: Optional[str] = Field(None, max_length=100, description="Modell")
    frame_size: Optional[str] = Field(None, max_length=20, description="Fassungsgröße (z.B. 52-18-140)")
    frame_color: Optional[str] = Field(None, max_length=50, description="Fassungsfarbe")
    lens_material: Optional[str] = Field(None, max_length=100, description="Glasmaterial")
    lens_coating: Optional[Dict[str, Any]] = Field(None, description="Glasbeschichtungen als JSON")
    details: Optional[Dict[str, Any]] = Field(None, description="Weitere Details als JSON")
    current_price: Decimal = Field(..., ge=0, description="Aktueller Preis")
    vat_rate: Decimal = Field(default=Decimal("0.19"), ge=0, le=1, description="Mehrwertsteuersatz")
    insurance_eligible: bool = Field(default=False, description="Kassenfähig")
    active: bool = Field(default=True, description="Aktiv")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    organization_id: Optional[int] = None
    product_type: Optional[ProductType] = None
    sku: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    brand: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    frame_size: Optional[str] = Field(None, max_length=20)
    frame_color: Optional[str] = Field(None, max_length=50)
    lens_material: Optional[str] = Field(None, max_length=100)
    lens_coating: Optional[Dict[str, Any]] = None
    details: Optional[Dict[str, Any]] = None
    current_price: Optional[Decimal] = Field(None, ge=0)
    vat_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    insurance_eligible: Optional[bool] = None
    active: Optional[bool] = None


class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductResponse(Product):
    pass


class ProductListResponse(BaseModel):
    products: list[Product]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool