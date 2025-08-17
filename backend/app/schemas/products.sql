-- Visual CRM - Products Schema
-- PostgreSQL/Supabase table definitions for optician product management

-- Product type enum
CREATE TYPE product_type AS ENUM ('frame', 'lens', 'contact_lens', 'accessory');

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    
    -- Basic product information
    product_type product_type NOT NULL,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    
    -- Frame-specific fields
    frame_size TEXT,
    frame_color TEXT,
    
    -- Lens-specific fields
    lens_material TEXT,
    lens_coating JSONB,
    
    -- Additional details (flexible storage)
    details JSONB,
    
    -- Pricing information
    current_price NUMERIC(10, 2) NOT NULL,
    vat_rate NUMERIC(3, 2) DEFAULT 0.19 CHECK (vat_rate >= 0 AND vat_rate <= 1),
    insurance_eligible BOOLEAN DEFAULT false,
    
    -- Status and metadata
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT products_price_positive CHECK (current_price > 0)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE (active = true);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('german', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(model, '')));

-- Trigger to automatically update updated_at on row changes
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their optician's products
CREATE POLICY "Users can manage products" ON products
    FOR ALL USING (true);  -- Simplified for development - adjust for production

-- Sample data for development (optional)
INSERT INTO products (
    organization_id,
    product_type, 
    sku, 
    name, 
    brand, 
    model,
    frame_size,
    frame_color,
    current_price,
    vat_rate,
    insurance_eligible,
    active
) VALUES 
    (1, 'frame', 'RB3025-001', 'Aviator Classic', 'Ray-Ban', '3025', '58-14-135', 'Gold', 159.99, 0.19, false, true),
    (1, 'frame', 'OO9208-920852', 'Radar EV Path', 'Oakley', '9208', 'One Size', 'Polished Black', 189.99, 0.19, false, true),
    (1, 'lens', 'ESS-1.5-AS', 'Einstärkenbrillenglas', 'Essilor', 'Standard', NULL, NULL, 89.99, 0.07, true, true),
    (1, 'contact_lens', 'DT1-90', 'Dailies Total1', 'Alcon', '90er Pack', NULL, NULL, 49.99, 0.19, true, true),
    (1, 'accessory', 'MC-SPRAY-50', 'Brillenreiniger', 'MicroClean', 'Spray 50ml', NULL, NULL, 12.99, 0.19, false, true)
ON CONFLICT (sku) DO NOTHING;