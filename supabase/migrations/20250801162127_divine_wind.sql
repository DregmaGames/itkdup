/*
  # Fix RLS policies and ensure demo users exist

  1. RLS Policies
    - Update all tables to have very permissive policies for demo
    - Allow authenticated users to perform all operations
    
  2. Demo Users
    - Ensure all 4 demo users exist with correct roles
    - Create profiles for each user type
    
  3. Security
    - Very permissive RLS for demo purposes
    - All authenticated users can access all data
*/

-- First, ensure all demo users exist in auth.users (this will be done manually)
-- We'll create the profiles assuming the users exist

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all access for demo" ON user_profiles;
DROP POLICY IF EXISTS "Allow all access for demo" ON certificadores;
DROP POLICY IF EXISTS "Allow all access for demo" ON consultores;
DROP POLICY IF EXISTS "Allow all access for demo" ON clientes;
DROP POLICY IF EXISTS "Allow all access for demo" ON productos;

-- Create very permissive policies for all tables
CREATE POLICY "Demo - Allow all operations" ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations" ON certificadores
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations" ON consultores
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations" ON clientes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations" ON productos
  FOR ALL USING (true) WITH CHECK (true);

-- Insert demo user profiles if they don't exist
-- Note: The actual auth.users must be created manually in Supabase dashboard

INSERT INTO user_profiles (id, email, role, name, avatar) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@demo.modularapp.com', 'Admin', 'Administrador Demo', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
  ('b0000000-0000-0000-0000-000000000001', 'cert@demo.modularapp.com', 'Cert', 'Certificador Demo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
  ('c0000000-0000-0000-0000-000000000001', 'consultor@demo.modularapp.com', 'Consultor', 'Consultor Demo', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
  ('d0000000-0000-0000-0000-000000000001', 'cliente@demo.modularapp.com', 'Cliente', 'Cliente Demo', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar,
  updated_at = now();

-- Create certificador demo profile
INSERT INTO certificadores (id, user_id, company_name, description, specialties, contact_info) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'TechCert Demo', 'Certificadora de demostración', ARRAY['Electrónica', 'Automatización'], '{"phone": "+54 11 4444-5555", "website": "https://techcert-demo.com"}')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  specialties = EXCLUDED.specialties,
  contact_info = EXCLUDED.contact_info,
  updated_at = now();

-- Create consultor demo profile
INSERT INTO consultores (id, user_id, certificador_id, company_name, description, specialties, contact_info) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Consultor Demo SRL', 'Consultoría de demostración', ARRAY['Inspecciones', 'Auditorías'], '{"phone": "+54 11 6666-7777", "email": "consultor@demo.modularapp.com"}')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  specialties = EXCLUDED.specialties,
  contact_info = EXCLUDED.contact_info,
  updated_at = now();

-- Create cliente demo profile
INSERT INTO clientes (id, user_id, consultor_id, company_name, sector, contact_info, address, firma_png_url) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Cliente Demo SA', 'Manufactura', '{"phone": "+54 11 8888-9999", "email": "cliente@demo.modularapp.com"}', 'Av. Demo 123, CABA, Argentina', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  sector = EXCLUDED.sector,
  contact_info = EXCLUDED.contact_info,
  address = EXCLUDED.address,
  firma_png_url = EXCLUDED.firma_png_url,
  updated_at = now();

-- Create some demo products for the cliente
INSERT INTO productos (id, cliente_id, name, brand, model, serial_number, description, category, qr_code_url, djc_document_url, djc_signed, certificate_url, certificate_expiry_date, status) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Motor Trifásico Demo', 'Siemens', 'SIMOTICS GP', 'SN-DEMO-001', 'Motor eléctrico trifásico para aplicaciones industriales', 'Motores', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/producto/e1000000-0000-0000-0000-000000000001', 'https://docs.google.com/document/d/demo-djc-001', true, 'https://drive.google.com/file/d/demo-cert-001', '2025-12-31', 'active'),
  ('e2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Panel de Control Demo', 'ABB', 'CP600', 'SN-DEMO-002', 'Panel de control para automatización industrial', 'Automatización', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/producto/e2000000-0000-0000-0000-000000000001', NULL, false, NULL, NULL, 'active'),
  ('e3000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Variador Demo', 'Schneider', 'ATV320', 'SN-DEMO-003', 'Variador de frecuencia para control de motores', 'Variadores', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/producto/e3000000-0000-0000-0000-000000000001', 'https://docs.google.com/document/d/demo-djc-003', true, 'https://drive.google.com/file/d/demo-cert-003', '2025-06-30', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  qr_code_url = EXCLUDED.qr_code_url,
  djc_document_url = EXCLUDED.djc_document_url,
  djc_signed = EXCLUDED.djc_signed,
  certificate_url = EXCLUDED.certificate_url,
  certificate_expiry_date = EXCLUDED.certificate_expiry_date,
  status = EXCLUDED.status,
  updated_at = now();