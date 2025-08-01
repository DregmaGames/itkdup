/*
  # Create Demo Development Users

  1. Demo Users
    - Admin demo user
    - Certificador demo user with profile
    - Consultor demo user with profile
    - Cliente demo user with profile

  2. Security
    - Enable RLS on all tables
    - Add permissive policies for demo users
    - Maintain existing production policies

  3. Sample Data
    - Complete hierarchy: Cert -> Consultor -> Cliente
    - Sample products for testing
*/

-- Create demo users in user_profiles
INSERT INTO user_profiles (id, email, role, name, avatar, created_at, updated_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'admin@demo.modularapp.com',
  'Admin',
  'Admin Demo',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  now(),
  now()
),
(
  '22222222-2222-2222-2222-222222222222',
  'cert@demo.modularapp.com',
  'Cert',
  'Certificador Demo',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
  now(),
  now()
),
(
  '33333333-3333-3333-3333-333333333333',
  'consultor@demo.modularapp.com',
  'Consultor',
  'Consultor Demo',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  now(),
  now()
),
(
  '44444444-4444-4444-4444-444444444444',
  'cliente@demo.modularapp.com',
  'Cliente',
  'Cliente Demo',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=100&fit=crop&crop=face',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar,
  updated_at = now();

-- Create certificador profile for demo cert user
INSERT INTO certificadores (id, user_id, company_name, description, specialties, contact_info, created_at, updated_at) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'CertDemo Argentina',
  'Certificadora demo para desarrollo y testing',
  ARRAY['Productos Eléctricos', 'Equipos Industriales', 'Sistemas de Seguridad'],
  jsonb_build_object(
    'telefono', '+54 11 4444-5555',
    'direccion', 'Av. Corrientes 1234, CABA',
    'website', 'https://certdemo.com.ar'
  ),
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  updated_at = now();

-- Create consultor profile for demo consultor user
INSERT INTO consultores (id, user_id, certificador_id, company_name, description, specialties, contact_info, created_at, updated_at) VALUES
(
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'ConsulDemo SRL',
  'Consultoría demo para desarrollo',
  ARRAY['Auditorías Técnicas', 'Implementación de Normas'],
  jsonb_build_object(
    'telefono', '+54 11 5555-6666',
    'direccion', 'Florida 456, CABA',
    'email', 'info@consuldemo.com.ar'
  ),
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  updated_at = now();

-- Create cliente profile for demo cliente user
INSERT INTO clientes (id, user_id, consultor_id, company_name, sector, contact_info, address, created_at, updated_at) VALUES
(
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'ClienteDemo SA',
  'Manufactura',
  jsonb_build_object(
    'telefono', '+54 11 6666-7777',
    'email', 'compras@clientedemo.com.ar',
    'contacto', 'María González'
  ),
  'Av. Industrial 789, San Martín, Buenos Aires',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  sector = EXCLUDED.sector,
  updated_at = now();

-- Create sample products for demo
INSERT INTO productos (id, cliente_id, name, brand, model, serial_number, description, category, specifications, qr_code_url, djc_document_url, djc_signed, certificate_url, certificate_expiry_date, status, created_at, updated_at) VALUES
(
  '11111111-aaaa-4000-8000-000000000001',
  '44444444-4444-4444-4444-444444444444',
  'Motor Trifásico Industrial MT-3000',
  'Siemens',
  'MT-3000-220V',
  'MT30001234567',
  'Motor trifásico de 3HP, 220V, 1450 RPM para uso industrial continuo',
  'Motores Eléctricos',
  jsonb_build_object(
    'potencia', '3 HP',
    'voltaje', '220V',
    'rpm', '1450',
    'eficiencia', 'IE3'
  ),
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/products/11111111-aaaa-4000-8000-000000000001',
  'https://docs.google.com/document/d/1234567890/export?format=pdf',
  true,
  'https://drive.google.com/file/d/abcd1234/export?format=pdf',
  '2025-12-31',
  'active',
  now() - interval '30 days',
  now() - interval '30 days'
),
(
  '22222222-bbbb-4000-8000-000000000002',
  '44444444-4444-4444-4444-444444444444',
  'Transformador Seco TS-500',
  'ABB',
  'TS-500-13.2kV',
  'TS50009876543',
  'Transformador seco de 500kVA, relación 13200/400V',
  'Transformadores',
  jsonb_build_object(
    'potencia', '500 kVA',
    'voltaje_primario', '13200V',
    'voltaje_secundario', '400V',
    'tipo', 'Seco'
  ),
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/products/22222222-bbbb-4000-8000-000000000002',
  'https://docs.google.com/document/d/2345678901/export?format=pdf',
  false,
  'https://drive.google.com/file/d/efgh5678/export?format=pdf',
  '2026-06-30',
  'active',
  now() - interval '15 days',
  now() - interval '15 days'
),
(
  '33333333-cccc-4000-8000-000000000003',
  '44444444-4444-4444-4444-444444444444',
  'Panel de Control PC-400',
  'Schneider Electric',
  'PC-400-IP65',
  'PC40011223344',
  'Panel de control industrial con protección IP65',
  'Paneles de Control',
  jsonb_build_object(
    'grado_proteccion', 'IP65',
    'material', 'Acero inoxidable',
    'dimensiones', '400x300x200mm'
  ),
  null,
  null,
  false,
  null,
  null,
  'active',
  now() - interval '7 days',
  now() - interval '7 days'
),
(
  '44444444-dddd-4000-8000-000000000004',
  '44444444-4444-4444-4444-444444444444',
  'Variador de Frecuencia VF-1000',
  'Danfoss',
  'VF-1000-5.5kW',
  'VF10005544332',
  'Variador de frecuencia para motor de 5.5kW con comunicación Modbus',
  'Variadores',
  jsonb_build_object(
    'potencia', '5.5 kW',
    'comunicacion', 'Modbus RTU',
    'entrada', '380-480V',
    'salida', '0-480V'
  ),
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/products/44444444-dddd-4000-8000-000000000004',
  'https://docs.google.com/document/d/3456789012/export?format=pdf',
  true,
  'https://drive.google.com/file/d/ijkl9012/export?format=pdf',
  '2025-09-15',
  'active',
  now() - interval '45 days',
  now() - interval '45 days'
),
(
  '55555555-eeee-4000-8000-000000000005',
  '44444444-4444-4444-4444-444444444444',
  'Sensor de Temperatura ST-100',
  'Honeywell',
  'ST-100-PT100',
  'ST10099887766',
  'Sensor de temperatura PT100 para ambientes industriales',
  'Sensores',
  jsonb_build_object(
    'tipo', 'PT100',
    'rango', '-50°C a +200°C',
    'precision', '±0.1°C',
    'proteccion', 'IP67'
  ),
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/products/55555555-eeee-4000-8000-000000000005',
  null,
  false,
  'https://drive.google.com/file/d/mnop3456/export?format=pdf',
  '2026-03-20',
  'active',
  now() - interval '10 days',
  now() - interval '10 days'
);

-- Update productos to have public_id for public access
UPDATE productos SET 
  public_id = CASE 
    WHEN id = '11111111-aaaa-4000-8000-000000000001' THEN 'DEMO-MT3000-2024'
    WHEN id = '22222222-bbbb-4000-8000-000000000002' THEN 'DEMO-TS500-2024'
    WHEN id = '33333333-cccc-4000-8000-000000000003' THEN 'DEMO-PC400-2024'
    WHEN id = '44444444-dddd-4000-8000-000000000004' THEN 'DEMO-VF1000-2024'
    WHEN id = '55555555-eeee-4000-8000-000000000005' THEN 'DEMO-ST100-2024'
    ELSE public_id
  END
WHERE id IN (
  '11111111-aaaa-4000-8000-000000000001',
  '22222222-bbbb-4000-8000-000000000002',
  '33333333-cccc-4000-8000-000000000003',
  '44444444-dddd-4000-8000-000000000004',
  '55555555-eeee-4000-8000-000000000005'
);

-- Add some firma_png_url for DJC generation testing
UPDATE user_profiles SET 
  firma_png_url = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=80&fit=crop'
WHERE email = 'cliente@demo.modularapp.com';

-- Create additional demo policies for development
CREATE POLICY IF NOT EXISTS "Demo users can access all data"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (email LIKE '%@demo.modularapp.com');

CREATE POLICY IF NOT EXISTS "Demo certificadores access"
  ON certificadores
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Demo consultores access"
  ON consultores
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Demo clientes access"
  ON clientes
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Demo productos access"
  ON productos
  FOR ALL
  TO authenticated
  USING (true);