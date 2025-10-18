from typing import Optional, Dict, Any, List
from datetime import datetime, date
from pydantic import BaseModel, Field
from enum import Enum
from decimal import Decimal


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    INSURANCE_PENDING = "insurance_pending"
    CANCELLED = "cancelled"


class InvoiceItemBase(BaseModel):
    product_id: Optional[int] = Field(None, description="Produkt-ID (Referenz)")
    product_snapshot: Dict[str, Any] = Field(..., description="Produktdaten zum Zeitpunkt der Rechnung")
    prescription_values: Optional[Dict[str, Any]] = Field(None, description="Rezeptwerte für diesen Artikel")
    quantity: int = Field(default=1, ge=1, description="Menge")
    unit_price: Decimal = Field(..., ge=0, description="Einzelpreis")
    discount_amount: Decimal = Field(default=Decimal("0"), ge=0, description="Rabattbetrag")
    vat_rate: Decimal = Field(..., ge=0, le=1, description="Mehrwertsteuersatz")
    line_total: Decimal = Field(..., ge=0, description="Zeilensumme")
    insurance_covered: bool = Field(default=False, description="Von Krankenkasse übernommen")


class InvoiceItemCreate(InvoiceItemBase):
    pass


class InvoiceItemUpdate(BaseModel):
    product_id: Optional[int] = None
    product_snapshot: Optional[Dict[str, Any]] = None
    prescription_values: Optional[Dict[str, Any]] = None
    quantity: Optional[int] = Field(None, ge=1)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    discount_amount: Optional[Decimal] = Field(None, ge=0)
    vat_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    line_total: Optional[Decimal] = Field(None, ge=0)
    insurance_covered: Optional[bool] = None


class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceCustomer(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None


class InvoiceBase(BaseModel):
    organization_id: int = Field(default=1, description="Organisation ID für Multi-Tenancy")
    customer_id: int = Field(..., description="Kunden-ID")
    invoice_date: date = Field(default_factory=date.today, description="Rechnungsdatum")
    due_date: Optional[date] = Field(None, description="Fälligkeitsdatum")
    prescription_snapshot: Optional[Dict[str, Any]] = Field(None, description="Rezeptdaten zum Zeitpunkt der Rechnung")
    insurance_provider: Optional[str] = Field(None, max_length=100, description="Krankenkasse")
    insurance_claim_number: Optional[str] = Field(None, max_length=50, description="Kassenscheinnummer")
    insurance_coverage_amount: Optional[Decimal] = Field(None, ge=0, description="Kassenleistung")
    patient_copay_amount: Optional[Decimal] = Field(None, ge=0, description="Eigenanteil Patient")
    status: InvoiceStatus = Field(default=InvoiceStatus.DRAFT, description="Rechnungsstatus")
    payment_method: Optional[str] = Field(None, max_length=50, description="Zahlungsart")
    notes: Optional[str] = Field(None, max_length=1000, description="Notizen")


class InvoiceCreate(InvoiceBase):
    subtotal: Decimal = Field(..., ge=0, description="Zwischensumme")
    vat_amount: Decimal = Field(..., ge=0, description="Mehrwertsteuerbetrag")
    total: Decimal = Field(..., ge=0, description="Gesamtsumme")
    items: Optional[List[InvoiceItemCreate]] = Field(default=[], description="Rechnungspositionen")


class InvoiceUpdate(BaseModel):
    organization_id: Optional[int] = None
    customer_id: Optional[int] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    prescription_snapshot: Optional[Dict[str, Any]] = None
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_claim_number: Optional[str] = Field(None, max_length=50)
    insurance_coverage_amount: Optional[Decimal] = Field(None, ge=0)
    patient_copay_amount: Optional[Decimal] = Field(None, ge=0)
    status: Optional[InvoiceStatus] = None
    payment_method: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=1000)
    subtotal: Optional[Decimal] = Field(None, ge=0)
    vat_amount: Optional[Decimal] = Field(None, ge=0)
    total: Optional[Decimal] = Field(None, ge=0)


class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    subtotal: Decimal
    vat_amount: Decimal
    total: Decimal
    created_at: datetime
    updated_at: datetime
    customer: Optional[InvoiceCustomer] = None

    class Config:
        from_attributes = True


class InvoiceWithItems(Invoice):
    items: List[InvoiceItem] = Field(default=[], description="Rechnungspositionen")


class InvoiceResponse(InvoiceWithItems):
    pass


class InvoiceListResponse(BaseModel):
    invoices: List[Invoice]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool