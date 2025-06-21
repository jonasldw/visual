# Implementation Roadmap

This document provides a detailed step-by-step guide for implementing the optician business database schema. Follow these phases in order to ensure proper dependencies and testing at each stage.

## Prerequisites

- [ ] Supabase project set up with PostgreSQL access
- [ ] FastAPI backend connected to Supabase
- [ ] Next.js frontend with Supabase client configured
- [ ] Access to Supabase dashboard for RLS policy management

## Phase 1: Foundation Setup (Priority: High)

### 1.1 Add organization_id to existing customers table

**Objective**: Enable multi-tenancy support for existing customer data

**Implementation Steps**:
1. Add migration file: `backend/migrations/001_add_organization_id.sql`
```sql
-- Add organization_id with default value for existing records
ALTER TABLE public.customers 
ADD COLUMN organization_id BIGINT NOT NULL DEFAULT 1;

-- Add index for performance
CREATE INDEX idx_customers_organization_id ON customers(organization_id);
```

2. Update FastAPI models: `backend/app/models/customer.py`
   - Add `organization_id` field
   - Update all queries to filter by organization

3. Update frontend API calls to include organization context

**Verification**:
- All existing customers have organization_id = 1
- New customer creation includes organization_id
- Customer queries are filtered by organization

### 1.2 Implement Products table for eyewear

**Objective**: Create product catalog for frames, lenses, and accessories

**Implementation Steps**:
1. Create migration: `backend/migrations/002_create_products_table.sql`
```sql
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  product_type TEXT CHECK (product_type IN ('frame', 'lens', 'contact_lens', 'accessory')),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  frame_size TEXT,
  frame_color TEXT,
  lens_material TEXT,
  lens_coating JSONB,
  details JSONB,
  current_price NUMERIC(10,2) NOT NULL,
  vat_rate NUMERIC(3,2) DEFAULT 0.19,
  insurance_eligible BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_organization_id ON products(organization_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;
CREATE INDEX idx_products_sku ON products(sku);
```

2. Create FastAPI models and endpoints:
   - `backend/app/models/product.py`
   - `backend/app/schemas/product.py`
   - `backend/app/api/endpoints/products.py`

3. Implement frontend product management:
   - Product list page with filters
   - Product create/edit forms
   - Product type-specific fields

**Verification**:
- Can create products of all types
- SKU uniqueness enforced
- Products filtered by organization

## Phase 2: Invoice System Core (Priority: High)

### 2.1 Set up sequential invoice numbering for German compliance

**Objective**: Implement gapless sequential numbering system

**Implementation Steps**:
1. Create sequence table and function: `backend/migrations/003_invoice_sequences.sql`
```sql
CREATE TABLE invoice_sequences (
  organization_id BIGINT NOT NULL,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, year)
);

CREATE OR REPLACE FUNCTION get_next_invoice_number(org_id BIGINT) 
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM NOW());
  next_number INTEGER;
BEGIN
  -- Lock the row to prevent concurrent access
  UPDATE invoice_sequences 
  SET last_number = last_number + 1
  WHERE organization_id = org_id AND year = current_year
  RETURNING last_number INTO next_number;
  
  IF NOT FOUND THEN
    INSERT INTO invoice_sequences (organization_id, year, last_number)
    VALUES (org_id, current_year, 1)
    RETURNING last_number INTO next_number;
  END IF;
  
  -- Format: YYYY-000001
  RETURN current_year || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
```

2. Test sequence generation for concurrency safety

**Verification**:
- Sequential numbers without gaps
- Year rollover creates new sequence
- Concurrent requests handled properly

### 2.2 Create Invoices table with insurance billing and prescription support

**Objective**: Core invoice entity with German insurance support

**Implementation Steps**:
1. Create invoices table: `backend/migrations/004_create_invoices_table.sql`
```sql
CREATE TABLE public.invoices (
  id SERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  prescription_snapshot JSONB,
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

-- Indexes
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
```

2. Create invoice trigger for automatic numbering:
```sql
CREATE OR REPLACE FUNCTION assign_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := get_next_invoice_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_number_trigger
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION assign_invoice_number();
```

3. Implement invoice API endpoints with status workflow

**Verification**:
- Invoice creation assigns sequential number
- Prescription data properly stored
- Insurance fields functional

### 2.3 Implement Invoice_Items table with product snapshots

**Objective**: Line items with historical data preservation

**Implementation Steps**:
1. Create invoice items table: `backend/migrations/005_create_invoice_items_table.sql`
```sql
CREATE TABLE public.invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_snapshot JSONB NOT NULL,
  prescription_values JSONB,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  vat_rate NUMERIC(3,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL,
  insurance_covered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);
```

2. Create trigger to update invoice totals:
```sql
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET 
    subtotal = (
      SELECT COALESCE(SUM(line_total), 0)
      FROM invoice_items
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    vat_amount = (
      SELECT COALESCE(SUM(line_total * vat_rate), 0)
      FROM invoice_items
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  UPDATE invoices
  SET total = subtotal + vat_amount
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_items_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();
```

**Verification**:
- Product snapshots capture current product state
- Invoice totals auto-calculate
- Cascade delete works properly

## Phase 3: Security & Performance (Priority: Medium)

### 3.1 Create RLS policies for organization-based data isolation

**Objective**: Ensure data security between organizations

**Implementation Steps**:
1. Enable RLS on all tables:
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
```

2. Create RLS policies: `backend/migrations/006_rls_policies.sql`
```sql
-- Customers policies
CREATE POLICY "org_isolation_customers" ON customers
FOR ALL USING (organization_id = current_setting('app.current_organization_id')::BIGINT);

-- Products policies
CREATE POLICY "org_isolation_products" ON products
FOR ALL USING (organization_id = current_setting('app.current_organization_id')::BIGINT);

-- Invoices policies
CREATE POLICY "org_isolation_invoices" ON invoices
FOR ALL USING (organization_id = current_setting('app.current_organization_id')::BIGINT);

-- Invoice items (via invoice relationship)
CREATE POLICY "org_isolation_invoice_items" ON invoice_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.organization_id = current_setting('app.current_organization_id')::BIGINT
  )
);
```

3. Update FastAPI to set organization context:
```python
# In database session middleware
async def set_organization_context(db: Session, organization_id: int):
    db.execute(f"SET LOCAL app.current_organization_id = {organization_id}")
```

**Verification**:
- Users can only see their organization's data
- Cross-organization queries return empty
- Performance impact acceptable

### 3.2 Add indexes for performance optimization

**Objective**: Optimize query performance

**Implementation Steps**:
1. Create performance indexes: `backend/migrations/007_performance_indexes.sql`
```sql
-- Search optimization
CREATE INDEX idx_customers_search ON customers(organization_id, last_name, first_name);
CREATE INDEX idx_products_search ON products(organization_id, name, brand);

-- Reporting optimization
CREATE INDEX idx_invoices_reporting ON invoices(organization_id, invoice_date, status);
CREATE INDEX idx_invoice_items_reporting ON invoice_items(invoice_id, product_id);

-- Foreign key optimization (if not auto-created)
CREATE INDEX idx_invoices_customer_fk ON invoices(customer_id);
```

2. Analyze query performance and add specific indexes as needed

**Verification**:
- Common queries use indexes
- Page load times acceptable
- Database query logs show index usage

## Phase 4: Testing & Documentation

### 4.1 Integration Testing
1. Test invoice creation workflow
2. Test insurance billing scenarios
3. Test prescription data handling
4. Test multi-organization isolation

### 4.2 Data Migration
1. Migrate existing customer data
2. Import product catalog
3. Set up initial organization

### 4.3 Documentation Updates
1. Update API documentation
2. Create user guides for invoice workflow
3. Document insurance billing process

## Success Criteria

- [ ] All tables created with proper constraints
- [ ] Sequential invoice numbering working without gaps
- [ ] RLS policies preventing cross-organization access
- [ ] Frontend can create/edit all entity types
- [ ] Insurance billing workflow functional
- [ ] Performance acceptable for 1000+ invoices
- [ ] All tests passing

## Rollback Plan

Each migration should include a rollback script:
```sql
-- Example rollback for products table
DROP TABLE IF EXISTS products CASCADE;
```

Keep migrations small and focused for easy rollback if issues arise.

## Next Steps After Implementation

1. **Monitoring**: Set up alerts for sequence gaps or RLS violations
2. **Backup**: Configure automated backups with point-in-time recovery
3. **Performance**: Monitor slow queries and optimize as needed
4. **Features**: Plan Phase 2 features (inventory, appointments, etc.)