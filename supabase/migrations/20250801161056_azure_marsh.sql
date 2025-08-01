/*
  # Create missing database tables for demo

  This migration creates all the required tables that are missing from the database:
  - user_profiles (main user table)
  - certificadores (certifiers)
  - consultores (consultants) 
  - clientes (clients)
  - productos (products)
  - public_productos (public view)

  Execute this in Supabase SQL Editor to fix the "relation does not exist" errors.
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Cert', 'Consultor', 'Cliente')),
  name text,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create certificadores table
CREATE TABLE IF NOT EXISTS certificadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  description text,
  specialties text[],
  contact_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultores table
CREATE TABLE IF NOT EXISTS consultores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  certificador_id uuid REFERENCES certificadores(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  description text,
  specialties text[],
  contact_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES consultores(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  sector text,
  contact_info jsonb DEFAULT '{}',
  address text,
  firma_png_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create productos table
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  model text,
  serial_number text,
  description text,
  category text,
  specifications jsonb DEFAULT '{}',
  qr_code_url text,
  djc_document_url text,
  djc_signed boolean DEFAULT false,
  certificate_url text,
  certificate_expiry_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create public view for productos
CREATE OR REPLACE VIEW public_productos AS
SELECT 
  id,
  name,
  brand,
  model,
  description,
  category,
  qr_code_url,
  djc_document_url,
  djc_signed,
  certificate_url,
  certificate_expiry_date,
  status,
  created_at
FROM productos
WHERE qr_code_url IS NOT NULL;

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo
CREATE POLICY "Allow all access for demo" ON user_profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access for demo" ON certificadores FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access for demo" ON consultores FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access for demo" ON clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access for demo" ON productos FOR ALL TO authenticated USING (true);

-- Insert minimal demo data
INSERT INTO user_profiles (id, email, role, name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin.demo@modularapp.com', 'Admin', 'Admin Demo'),
('550e8400-e29b-41d4-a716-446655440002', 'cert.demo@modularapp.com', 'Cert', 'Certificador Demo'),
('550e8400-e29b-41d4-a716-446655440003', 'consultor.demo@modularapp.com', 'Consultor', 'Consultor Demo'),
('550e8400-e29b-41d4-a716-446655440004', 'cliente.demo@modularapp.com', 'Cliente', 'Cliente Demo')
ON CONFLICT (email) DO NOTHING;