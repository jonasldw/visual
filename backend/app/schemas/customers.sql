-- Visual CRM - Customer Schema
-- PostgreSQL/Supabase table definitions for optician customer management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customer status enum
CREATE TYPE customer_status AS ENUM ('aktiv', 'inaktiv', 'interessent', 'archiviert');

-- Insurance type enum  
CREATE TYPE insurance_type AS ENUM ('gesetzlich', 'privat', 'selbstzahler');

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    
    -- Basic information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    date_of_birth DATE,
    
    -- Address information
    address_street VARCHAR(200),
    address_city VARCHAR(100),
    address_postal_code VARCHAR(10),
    address_country VARCHAR(50) DEFAULT 'Deutschland',
    
    -- Insurance information
    insurance_provider VARCHAR(100),
    insurance_type insurance_type,
    insurance_number VARCHAR(50),
    
    -- Medical/Optical information
    last_exam_date DATE,
    next_appointment TIMESTAMPTZ,
    
    -- Prescription values (diopters and measurements)
    prescription_sphere_right DECIMAL(4,2) CHECK (prescription_sphere_right >= -20.0 AND prescription_sphere_right <= 20.0),
    prescription_sphere_left DECIMAL(4,2) CHECK (prescription_sphere_left >= -20.0 AND prescription_sphere_left <= 20.0),
    prescription_cylinder_right DECIMAL(4,2) CHECK (prescription_cylinder_right >= -10.0 AND prescription_cylinder_right <= 10.0),
    prescription_cylinder_left DECIMAL(4,2) CHECK (prescription_cylinder_left >= -10.0 AND prescription_cylinder_left <= 10.0),
    prescription_axis_right INTEGER CHECK (prescription_axis_right >= 0 AND prescription_axis_right <= 180),
    prescription_axis_left INTEGER CHECK (prescription_axis_left >= 0 AND prescription_axis_left <= 180),
    prescription_addition DECIMAL(3,2) CHECK (prescription_addition >= 0.0 AND prescription_addition <= 5.0),
    prescription_pd DECIMAL(4,1) CHECK (prescription_pd >= 50.0 AND prescription_pd <= 80.0),
    
    -- Additional information
    allergies TEXT,
    medical_notes TEXT,
    frame_preferences TEXT,
    contact_preference VARCHAR(50) DEFAULT 'email',
    
    -- Status and metadata
    status customer_status DEFAULT 'interessent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_next_appointment ON customers(next_appointment);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin(to_tsvector('german', first_name || ' ' || last_name || ' ' || COALESCE(email, '')));

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row changes
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their optician's customers
-- (This will need to be adapted based on your authentication setup)
CREATE POLICY "Users can manage customers" ON customers
    FOR ALL USING (true);  -- Simplified for development - adjust for production

-- Sample data for development (optional)
INSERT INTO customers (
    first_name, 
    last_name, 
    email, 
    phone, 
    date_of_birth,
    address_street,
    address_city,
    address_postal_code,
    insurance_provider,
    insurance_type,
    last_exam_date,
    prescription_sphere_right,
    prescription_sphere_left,
    status
) VALUES 
    ('Max', 'Mustermann', 'max.mustermann@email.com', '+49 123 456789', '1985-06-15', 'Musterstraße 123', 'Berlin', '10115', 'AOK', 'gesetzlich', '2024-01-15', -2.25, -2.50, 'aktiv'),
    ('Anna', 'Schmidt', 'anna.schmidt@email.com', '+49 987 654321', '1992-03-22', 'Hauptstraße 45', 'Hamburg', '20095', 'TK', 'gesetzlich', '2024-02-20', -1.75, -1.25, 'aktiv'),
    ('Thomas', 'Weber', 'thomas.weber@email.com', '+49 555 123456', '1978-11-08', 'Kirchgasse 67', 'München', '80331', 'Privat Krankenversicherung', 'privat', '2023-12-10', -3.00, -2.75, 'aktiv')
ON CONFLICT (email) DO NOTHING;