from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class CustomerStatus(str, Enum):
    ACTIVE = "aktiv"
    INACTIVE = "inaktiv"
    PROSPECT = "interessent"
    ARCHIVED = "archiviert"


class InsuranceType(str, Enum):
    STATUTORY = "gesetzlich"
    PRIVATE = "privat"
    SELF_PAY = "selbstzahler"


class CustomerBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100, description="Vorname")
    last_name: str = Field(..., min_length=1, max_length=100, description="Nachname")
    email: Optional[EmailStr] = Field(None, description="E-Mail-Adresse")
    phone: Optional[str] = Field(None, max_length=20, description="Telefonnummer")
    mobile: Optional[str] = Field(None, max_length=20, description="Mobilnummer")
    date_of_birth: Optional[date] = Field(None, description="Geburtsdatum")
    address_street: Optional[str] = Field(None, max_length=200, description="Straße und Hausnummer")
    address_city: Optional[str] = Field(None, max_length=100, description="Stadt")
    address_postal_code: Optional[str] = Field(None, max_length=10, description="Postleitzahl")
    address_country: Optional[str] = Field(default="Deutschland", max_length=50, description="Land")
    
    # Insurance information
    insurance_provider: Optional[str] = Field(None, max_length=100, description="Krankenkasse")
    insurance_type: Optional[InsuranceType] = Field(None, description="Versicherungsart")
    insurance_number: Optional[str] = Field(None, max_length=50, description="Versicherungsnummer")
    
    # Medical/Optical information
    last_exam_date: Optional[date] = Field(None, description="Letzter Sehtest")
    next_appointment: Optional[datetime] = Field(None, description="Nächster Termin")
    prescription_sphere_right: Optional[float] = Field(None, ge=-20.0, le=20.0, description="Sphäre rechts (dpt)")
    prescription_sphere_left: Optional[float] = Field(None, ge=-20.0, le=20.0, description="Sphäre links (dpt)")
    prescription_cylinder_right: Optional[float] = Field(None, ge=-10.0, le=10.0, description="Zylinder rechts (dpt)")
    prescription_cylinder_left: Optional[float] = Field(None, ge=-10.0, le=10.0, description="Zylinder links (dpt)")
    prescription_axis_right: Optional[int] = Field(None, ge=0, le=180, description="Achse rechts (°)")
    prescription_axis_left: Optional[int] = Field(None, ge=0, le=180, description="Achse links (°)")
    prescription_addition: Optional[float] = Field(None, ge=0.0, le=5.0, description="Addition (dpt)")
    prescription_pd: Optional[float] = Field(None, ge=50.0, le=80.0, description="Pupillendistanz (mm)")
    
    # Additional notes and preferences
    allergies: Optional[str] = Field(None, max_length=500, description="Allergien")
    medical_notes: Optional[str] = Field(None, max_length=1000, description="Medizinische Notizen")
    frame_preferences: Optional[str] = Field(None, max_length=500, description="Fassungsvorlieben")
    contact_preference: Optional[str] = Field(default="email", description="Bevorzugte Kontaktmethode")
    
    status: CustomerStatus = Field(default=CustomerStatus.PROSPECT, description="Kundenstatus")


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    mobile: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    address_street: Optional[str] = Field(None, max_length=200)
    address_city: Optional[str] = Field(None, max_length=100)
    address_postal_code: Optional[str] = Field(None, max_length=10)
    address_country: Optional[str] = Field(None, max_length=50)
    
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_type: Optional[InsuranceType] = None
    insurance_number: Optional[str] = Field(None, max_length=50)
    
    last_exam_date: Optional[date] = None
    next_appointment: Optional[datetime] = None
    prescription_sphere_right: Optional[float] = Field(None, ge=-20.0, le=20.0)
    prescription_sphere_left: Optional[float] = Field(None, ge=-20.0, le=20.0)
    prescription_cylinder_right: Optional[float] = Field(None, ge=-10.0, le=10.0)
    prescription_cylinder_left: Optional[float] = Field(None, ge=-10.0, le=10.0)
    prescription_axis_right: Optional[int] = Field(None, ge=0, le=180)
    prescription_axis_left: Optional[int] = Field(None, ge=0, le=180)
    prescription_addition: Optional[float] = Field(None, ge=0.0, le=5.0)
    prescription_pd: Optional[float] = Field(None, ge=50.0, le=80.0)
    
    allergies: Optional[str] = Field(None, max_length=500)
    medical_notes: Optional[str] = Field(None, max_length=1000)
    frame_preferences: Optional[str] = Field(None, max_length=500)
    contact_preference: Optional[str] = None
    
    status: Optional[CustomerStatus] = None


class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CustomerResponse(Customer):
    pass


class CustomerListResponse(BaseModel):
    customers: list[Customer]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool