# Database Schema Documentation

## Overview

This document describes the database schema for an optician business management system built with Supabase PostgreSQL. The system is designed to handle customer management, product inventory, invoicing, and German insurance billing requirements.

## Core Design Principles

- **Multi-tenancy**: All tables include `organization_id` to support multiple optician businesses
- **Data Integrity**: Historical data is preserved through JSONB snapshots
- **German Compliance**: Sequential invoice numbering and VAT handling per German regulations
- **Insurance Integration**: Built-in support for German health insurance billing workflows

## Table Relationships

```
Organizations (implicit)
    ↓
Customers (existing)
    ↓
Invoices ←→ Invoice_Items
    ↑            ↓
    └─────── Products
```

## Tables

### 1. Customers Table (Existing)

The customers table stores comprehensive patient/customer information including personal details, contact information, insurance data, and optical prescriptions.

#### Key Fields:
- `id` (BIGINT): Primary key, auto-incrementing
- `organization_id` (BIGINT): Multi-tenancy identifier (to be added)
- `first_name`, `last_name` (VARCHAR): Customer identification
- `email` (VARCHAR, UNIQUE): Primary contact method
- `insurance_provider`, `insurance_type`, `insurance_number`: German insurance integration
- **Prescription fields**:
  - `prescription_sphere_right/left`: Spherical correction (-20.0 to +20.0)
  - `prescription_cylinder_right/left`: Cylindrical correction (-10.0 to +10.0)
  - `prescription_axis_right/left`: Axis orientation (0-180 degrees)
  - `prescription_addition`: Reading addition (0.0 to +5.0)
  - `prescription_pd`: Pupillary distance (50.0 to 80.0mm)
- `status`: Customer lifecycle (interessent, kunde, etc.)
- `created_at`, `updated_at`: Audit timestamps

### 2. Products Table

Stores all sellable items including frames, lenses, contact lenses, and accessories.

#### Schema:
```sql
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  product_type TEXT CHECK (product_type IN ('frame', 'lens', 'contact_lens', 'accessory')),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  frame_size TEXT,              -- e.g., "52-18-140"
  frame_color TEXT,
  lens_material TEXT,           -- e.g., "1.67 high-index"
  lens_coating JSONB,           -- {"anti_reflective": true, "blue_light": true}
  details JSONB,                -- Flexible additional attributes
  current_price NUMERIC(10,2) NOT NULL,
  vat_rate NUMERIC(3,2) DEFAULT 0.19,
  insurance_eligible BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Field Details:
- `product_type`: Categorizes products for different handling logic
- `sku`: Stock keeping unit for inventory management
- `frame_size`: Standard frame measurements (lens width-bridge width-temple length)
- `lens_coating`: JSONB for flexible coating options without schema changes
- `insurance_eligible`: Marks products covered by German health insurance
- `vat_rate`: 19% standard, 7% reduced rate support

### 3. Invoices Table

Central billing entity supporting both direct sales and insurance claims.

#### Schema:
```sql
CREATE TABLE public.invoices (
  id SERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  prescription_snapshot JSONB,      -- Prescription at time of sale
  insurance_provider TEXT,
  insurance_claim_number TEXT,
  insurance_coverage_amount NUMERIC(10,2),
  patient_copay_amount NUMERIC(10,2),
  subtotal NUMERIC(10,2) NOT NULL,
  vat_amount NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'insurance_pending', 'cancelled')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Key Features:
- `invoice_number`: Sequential, gapless numbering per German tax law
- `prescription_snapshot`: Preserves prescription data at sale time
- **Insurance fields**: Support split billing between insurance and patient
- **Status workflow**: Tracks invoice lifecycle including insurance processing

### 4. Invoice_Items Table

Line items for each invoice, preserving product details at time of sale.

#### Schema:
```sql
CREATE TABLE public.invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_snapshot JSONB NOT NULL,
  prescription_values JSONB,        -- Item-specific prescription
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  vat_rate NUMERIC(3,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL,
  insurance_covered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Design Rationale:
- `product_snapshot`: Complete product details frozen at sale time
- `prescription_values`: Allows custom prescription per lens if needed
- `insurance_covered`: Item-level insurance tracking
- Cascade delete ensures invoice deletion removes all items

### 5. Invoice_Sequences Table

Maintains gapless sequential numbering per organization and year.

#### Schema:
```sql
CREATE TABLE invoice_sequences (
  organization_id BIGINT NOT NULL,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, year)
);
```

Used by `get_next_invoice_number()` function to ensure German tax compliance.

## Relationships

### Customer → Invoices (One-to-Many)
- Each customer can have multiple invoices
- Linked via `invoices.customer_id` → `customers.id`
- Customer deletion should be restricted if invoices exist

### Invoice → Invoice_Items (One-to-Many)
- Each invoice contains multiple line items
- Linked via `invoice_items.invoice_id` → `invoices.id`
- Cascade delete removes items when invoice is deleted

### Products → Invoice_Items (One-to-Many, Soft Link)
- Products referenced by invoice items
- Soft link allows product deletion without affecting historical invoices
- Product details preserved in `product_snapshot` JSONB

### Organization-based Isolation
- All tables include `organization_id` for multi-tenancy
- Row Level Security (RLS) policies ensure data isolation

## Indexes

### Primary Indexes (Automatic)
- All primary keys (`id` fields)
- Unique constraints (`customers.email`, `products.sku`, `invoices.invoice_number`)

### Recommended Additional Indexes
```sql
-- Performance indexes
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_organization_date ON invoices(organization_id, invoice_date DESC);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_products_organization_type ON products(organization_id, product_type);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;

-- Search indexes
CREATE INDEX idx_customers_email_org ON customers(organization_id, email);
CREATE INDEX idx_customers_name_search ON customers(organization_id, last_name, first_name);
```

## Security Considerations

### Row Level Security (RLS)
```sql
-- Example RLS policy for customers
CREATE POLICY "Users see own organization's customers"
ON customers FOR ALL
USING (organization_id = current_setting('app.current_organization_id')::BIGINT);
```

### Data Privacy
- Personal data (PII) concentrated in customers table
- Medical data (prescriptions) requires special GDPR compliance
- Audit trails via created_at/updated_at timestamps

## German Regulatory Compliance

### Invoice Numbering
- Sequential without gaps (Grundsätze ordnungsmäßiger Buchführung - GoB)
- Year-based sequences reset annually
- Implemented via `get_next_invoice_number()` function with row locking

### VAT Handling
- Standard rate: 19% (most products)
- Reduced rate: 7% (some medical devices)
- VAT calculation and storage at invoice level

### Insurance Integration
- Supports split billing (insurance + patient copay)
- Preserves insurance claim numbers
- Tracks coverage amounts per invoice

## Future Considerations

### Potential Enhancements
1. **Prescription History Table**: Track prescription changes over time
2. **Inventory Management**: Add stock levels and reorder points
3. **Appointment Integration**: Link invoices to appointments
4. **Lab Orders**: Track lens manufacturing orders
5. **Returns/Refunds**: Dedicated credit note handling

### Scalability
- JSONB fields provide schema flexibility
- Partition invoices table by year for large datasets
- Consider read replicas for reporting workloads