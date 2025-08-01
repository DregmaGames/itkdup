/*
  # Setup Complete Demo Database

  1. New Tables
    - `user_profiles` - User accounts with roles
    - `certificadores` - Certifier profiles  
    - `consultores` - Consultant profiles
    - `clientes` - Client profiles
    - `productos` - Product catalog
    - `public_productos` - Public view for product verification

  2. Demo Data
    - 2 Certificadores with realistic company info
    - 6 Consultores distributed across certifiers
    - 12 Clientes across different sectors
    - 30 Productos with various document states
    - All with realistic Spanish business data

  3. Security
    - Enable RLS on all tables
    - Add permissive policies for demo purposes
    - Allow admin user to see all data

  4. Public Access
    - Create public view for product verification
    - Enable anonymous access to public products
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Cert', 'Consultor', 'Cliente')),
  name text,
  avatar text,
  firma_png_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Certificadores Table
CREATE TABLE IF NOT EXISTS certificadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  empresa text,
  especialidad text,
  telefono text,
  direccion text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consultores Table  
CREATE TABLE IF NOT EXISTS consultores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  certificador_id uuid REFERENCES certificadores(id) ON DELETE SET NULL,
  empresa text,
  especialidad text,
  telefono text,
  direccion text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clientes Table
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES consultores(id) ON DELETE SET NULL,
  cuit text,
  razon_social text,
  nombre_comercial text,
  empresa text,
  sector text,
  telefono text,
  direccion text,
  avatar text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Productos Table
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  fabricante text NOT NULL,
  fecha date NOT NULL,
  qr_code_url text,
  djc_url text,
  certificado_url text,
  djc_firmada_url text,
  public_id uuid UNIQUE DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES user_profiles(id),
  consultor_id uuid REFERENCES consultores(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Public Products View
CREATE OR REPLACE VIEW public_productos AS
SELECT 
  public_id,
  nombre,
  fabricante,
  fecha,
  qr_code_url,
  djc_url,
  certificado_url,
  created_at,
  updated_at
FROM productos 
WHERE public_id IS NOT NULL;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Demo-friendly policies (very permissive for demo purposes)
CREATE POLICY "Demo - Allow all operations on user_profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations on certificadores"
  ON certificadores
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations on consultores"
  ON consultores
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations on clientes"
  ON clientes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Demo - Allow all operations on productos"
  ON productos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public access to public products view
CREATE POLICY "Public access to public_productos"
  ON productos
  FOR SELECT
  TO anon
  USING (public_id IS NOT NULL);

-- =======================
-- DEMO DATA INSERTION
-- =======================

-- 1. Insert Admin User
INSERT INTO user_profiles (id, email, role, name) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@modularapp.com', 'Admin', 'Administrador Sistema');

-- 2. Insert Certificadores
INSERT INTO user_profiles (id, email, role, name) VALUES
('22222222-2222-2222-2222-222222222222', 'carlos.rodriguez@techcert.com.ar', 'Cert', 'Carlos Rodríguez'),
('33333333-3333-3333-3333-333333333333', 'ana.martinez@electrosafe.com.ar', 'Cert', 'Ana Martínez');

INSERT INTO certificadores (id, user_id, empresa, especialidad, telefono, direccion) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'TechCert Argentina S.A.', 'Equipos Industriales y Maquinaria', '+54 11 4555-1234', 'Av. Corrientes 1234, CABA'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'ElectroSafe Certificaciones', 'Seguridad Eléctrica y Normativas', '+54 11 4555-5678', 'Av. Santa Fe 2345, CABA');

-- 3. Insert Consultores
INSERT INTO user_profiles (id, email, role, name) VALUES
('44444444-4444-4444-4444-444444444444', 'miguel.torres@industrial.com.ar', 'Consultor', 'Miguel Torres'),
('55555555-5555-5555-5555-555555555555', 'laura.garcia@comercial.com.ar', 'Consultor', 'Laura García'),
('66666666-6666-6666-6666-666666666666', 'roberto.fernandez@seguridad.com.ar', 'Consultor', 'Roberto Fernández'),
('77777777-7777-7777-7777-777777777777', 'patricia.lopez@mantenimiento.com.ar', 'Consultor', 'Patricia López'),
('88888888-8888-8888-8888-888888888888', 'diego.morales@energia.com.ar', 'Consultor', 'Diego Morales'),
('99999999-9999-9999-9999-999999999999', 'sofia.ruiz@automatizacion.com.ar', 'Consultor', 'Sofía Ruiz');

INSERT INTO consultores (id, user_id, certificador_id, empresa, especialidad, telefono, direccion) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consultoría Industrial del Sur', 'Equipos Industriales', '+54 11 4777-1111', 'Av. Belgrano 567, CABA'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consultoría Comercial Avanzada', 'Instalaciones Comerciales', '+54 11 4777-2222', 'Av. Rivadavia 890, CABA'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Seguridad Eléctrica Premium', 'Seguridad y Normativas', '+54 11 4777-3333', 'Av. 9 de Julio 1234, CABA'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mantenimiento y Auditorías S.A.', 'Mantenimiento Preventivo', '+54 11 4777-4444', 'Av. Libertador 567, CABA'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '88888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Energía Renovable Consultoría', 'Energías Renovables', '+54 11 4777-5555', 'Av. Córdoba 789, CABA'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Automatización Industrial Tech', 'Automatización y Control', '+54 11 4777-6666', 'Av. Las Heras 345, CABA');

-- 4. Insert Clientes
INSERT INTO user_profiles (id, email, role, name) VALUES
('c1111111-1111-1111-1111-111111111111', 'contacto@metalurgica-del-plata.com.ar', 'Cliente', 'Juan Carlos Pérez'),
('c2222222-2222-2222-2222-222222222222', 'gerencia@textil-buenos-aires.com.ar', 'Cliente', 'María Elena Vásquez'),
('c3333333-3333-3333-3333-333333333333', 'compras@supermercado-central.com.ar', 'Cliente', 'Ricardo Mendoza'),
('c4444444-4444-4444-4444-444444444444', 'mantenimiento@shopping-norte.com.ar', 'Cliente', 'Carla Moreno'),
('c5555555-5555-5555-5555-555555555555', 'infraestructura@hospital-italiano.org.ar', 'Cliente', 'Dr. Alberto Sánchez'),
('c6666666-6666-6666-6666-666666666666', 'servicios@universidad-tecnologica.edu.ar', 'Cliente', 'Ing. Lucía Herrera'),
('c7777777-7777-7777-7777-777777777777', 'produccion@autopartes-cordoba.com.ar', 'Cliente', 'Fernando Castro'),
('c8888888-8888-8888-8888-888888888888', 'facilidades@torre-corporativa.com.ar', 'Cliente', 'Valeria Romero'),
('c9999999-9999-9999-9999-999999999999', 'operaciones@puerto-madero.com.ar', 'Cliente', 'Sebastián Aguirre'),
('ca111111-1111-1111-1111-111111111111', 'mantenimiento@centro-logistico.com.ar', 'Cliente', 'Gabriela Ruiz'),
('cb222222-2222-2222-2222-222222222222', 'infraestructura@clinica-privada.com.ar', 'Cliente', 'Dr. Martín Díaz'),
('cc333333-3333-3333-3333-333333333333', 'servicios@planta-quimica.com.ar', 'Cliente', 'Ing. Andrea Silva');

INSERT INTO clientes (id, user_id, consultor_id, cuit, razon_social, nombre_comercial, empresa, sector, telefono, direccion) VALUES
('cl111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '30-68521479-8', 'Metalúrgica del Plata S.A.', 'MetalPlata', 'Metalúrgica del Plata S.A.', 'Manufactura', '+54 11 4321-1111', 'Parque Industrial Tigre, Buenos Aires'),
('cl222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '30-71234567-9', 'Textil Buenos Aires S.R.L.', 'TextilBA', 'Textil Buenos Aires S.R.L.', 'Manufactura', '+54 11 4321-2222', 'Zona Franca La Plata, Buenos Aires'),
('cl333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '30-89876543-2', 'Supermercado Central S.A.', 'Central Market', 'Supermercado Central S.A.', 'Comercio', '+54 11 4321-3333', 'Av. Cabildo 2456, CABA'),
('cl444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Shopping Norte S.A.', '30-76543210-1', 'Mall Norte', 'Shopping Norte S.A.', 'Comercio', '+54 11 4321-4444', 'Panamericana Km 15, Zona Norte'),
('cl555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '30-54321098-7', 'Hospital Italiano de Buenos Aires', 'Hospital Italiano', 'Hospital Italiano de Buenos Aires', 'Salud', '+54 11 4321-5555', 'Av. Juan B. Justo 4026, CABA'),
('cl666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '30-43210987-6', 'Universidad Tecnológica Nacional', 'UTN FRBA', 'Universidad Tecnológica Nacional', 'Educación', '+54 11 4321-6666', 'Medrano 951, CABA'),
('cl777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '30-32109876-5', 'Autopartes Córdoba S.A.', 'AutoCordoba', 'Autopartes Córdoba S.A.', 'Manufactura', '+54 351 456-7777', 'Parque Industrial Córdoba'),
('cl888888-8888-8888-8888-888888888888', 'c8888888-8888-8888-8888-888888888888', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '30-21098765-4', 'Torre Corporativa Madero S.A.', 'Torre Madero', 'Torre Corporativa Madero S.A.', 'Servicios', '+54 11 4321-8888', 'Puerto Madero, CABA'),
('cl999999-9999-9999-9999-999999999999', 'c9999999-9999-9999-9999-999999999999', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '30-10987654-3', 'Operaciones Puerto Madero S.A.', 'OpePuerto', 'Operaciones Puerto Madero S.A.', 'Transporte', '+54 11 4321-9999', 'Puerto Madero Sur, CABA'),
('cla11111-1111-1111-1111-111111111111', 'ca111111-1111-1111-1111-111111111111', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '30-09876543-2', 'Centro Logístico del Sur S.A.', 'LogiSur', 'Centro Logístico del Sur S.A.', 'Transporte', '+54 11 4321-0001', 'Parque Industrial Ezeiza'),
('clb22222-2222-2222-2222-222222222222', 'cb222222-2222-2222-2222-222222222222', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '30-98765432-1', 'Clínica Privada del Norte S.A.', 'Clínica Norte', 'Clínica Privada del Norte S.A.', 'Salud', '+54 11 4321-0002', 'Av. del Libertador 5678, Zona Norte'),
('clc33333-3333-3333-3333-333333333333', 'cc333333-3333-3333-3333-333333333333', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '30-87654321-0', 'Planta Química San Isidro S.A.', 'QuímicaSI', 'Planta Química San Isidro S.A.', 'Manufactura', '+54 11 4321-0003', 'Parque Industrial San Isidro');

-- 5. Insert Productos with realistic data
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, public_id, cliente_id, consultor_id) VALUES
-- Productos de Metalúrgica del Plata (Cliente Industrial)
('p1111111-1111-1111-1111-111111111111', 'Motor Trifásico 50HP', 'Siemens Argentina', '2024-01-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p1111111', 'https://docs.google.com/document/d/1example1/edit', 'https://drive.google.com/file/d/1cert1/view', gen_random_uuid(), 'c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('p2222222-2222-2222-2222-222222222222', 'Transformador 500KVA', 'ABB Argentina', '2024-01-20', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p2222222', NULL, 'https://drive.google.com/file/d/1cert2/view', gen_random_uuid(), 'c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('p3333333-3333-3333-3333-333333333333', 'Prensa Hidráulica 200T', 'Industrias Romi', '2024-02-01', NULL, 'https://docs.google.com/document/d/1example3/edit', NULL, gen_random_uuid(), 'c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),

-- Productos de Textil Buenos Aires (Cliente Industrial)
('p4444444-4444-4444-4444-444444444444', 'Telar Industrial Automático', 'Picanol Argentina', '2024-02-10', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p4444444', 'https://docs.google.com/document/d/1example4/edit', 'https://drive.google.com/file/d/1cert4/view', gen_random_uuid(), 'c2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('p5555555-5555-5555-5555-555555555555', 'Compresor de Aire 100HP', 'Atlas Copco', '2024-02-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p5555555', NULL, NULL, gen_random_uuid(), 'c2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),

-- Productos de Supermercado Central (Cliente Comercial)
('p6666666-6666-6666-6666-666666666666', 'Sistema de Refrigeración Comercial', 'Carrier Argentina', '2024-02-20', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p6666666', 'https://docs.google.com/document/d/1example6/edit', 'https://drive.google.com/file/d/1cert6/view', gen_random_uuid(), 'c3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('p7777777-7777-7777-7777-777777777777', 'UPS Trifásico 20KVA', 'APC by Schneider Electric', '2024-02-25', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p7777777', 'https://docs.google.com/document/d/1example7/edit', NULL, gen_random_uuid(), 'c3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('p8888888-8888-8888-8888-888888888888', 'Tablero Eléctrico Principal', 'Schneider Electric Argentina', '2024-03-01', NULL, NULL, 'https://drive.google.com/file/d/1cert8/view', gen_random_uuid(), 'c3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),

-- Productos de Shopping Norte (Cliente Comercial)
('p9999999-9999-9999-9999-999999999999', 'Sistema HVAC Central', 'Daikin Argentina', '2024-03-05', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p9999999', 'https://docs.google.com/document/d/1example9/edit', 'https://drive.google.com/file/d/1cert9/view', gen_random_uuid(), 'c4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('pa111111-1111-1111-1111-111111111111', 'Escaleras Mecánicas', 'Otis Argentina', '2024-03-10', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pa111111', NULL, 'https://drive.google.com/file/d/1certa/view', gen_random_uuid(), 'c4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),

-- Productos de Hospital Italiano (Cliente Salud)
('pb222222-2222-2222-2222-222222222222', 'Grupo Electrógeno 500KW', 'Caterpillar Argentina', '2024-03-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pb222222', 'https://docs.google.com/document/d/1exampleb/edit', 'https://drive.google.com/file/d/1certb/view', gen_random_uuid(), 'c5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('pc333333-3333-3333-3333-333333333333', 'Sistema de Emergencia Médica', 'Philips Healthcare', '2024-03-20', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pc333333', 'https://docs.google.com/document/d/1examplec/edit', NULL, gen_random_uuid(), 'c5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('pd444444-4444-4444-4444-444444444444', 'Tablero de Distribución Hospitalaria', 'Legrand Argentina', '2024-03-25', NULL, 'https://docs.google.com/document/d/1exampled/edit', 'https://drive.google.com/file/d/1certd/view', gen_random_uuid(), 'c5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),

-- Productos de Universidad Tecnológica (Cliente Educación)
('pe555555-5555-5555-5555-555555555555', 'Laboratorio de Electricidad Modular', 'Schneider Electric Educational', '2024-04-01', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pe555555', 'https://docs.google.com/document/d/1examplee/edit', 'https://drive.google.com/file/d/1certe/view', gen_random_uuid(), 'c6666666-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('pf666666-6666-6666-6666-666666666666', 'Sistema de Audio Universitario', 'Bose Professional', '2024-04-05', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pf666666', NULL, 'https://drive.google.com/file/d/1certf/view', gen_random_uuid(), 'c6666666-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),

-- Productos de Autopartes Córdoba (Cliente Manufactura)
('pg777777-7777-7777-7777-777777777777', 'Robot de Soldadura Automática', 'KUKA Argentina', '2024-04-10', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pg777777', 'https://docs.google.com/document/d/1exampleg/edit', 'https://drive.google.com/file/d/1certg/view', gen_random_uuid(), 'c7777777-7777-7777-7777-777777777777', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
('ph888888-8888-8888-8888-888888888888', 'Horno Industrial Eléctrico', 'Indarco Argentina', '2024-04-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ph888888', 'https://docs.google.com/document/d/1exampleh/edit', NULL, gen_random_uuid(), 'c7777777-7777-7777-7777-777777777777', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),

-- Productos de Torre Corporativa (Cliente Servicios)
('pi999999-9999-9999-9999-999999999999', 'Central de Incendio Inteligente', 'Notifier Argentina', '2024-04-20', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pi999999', NULL, 'https://drive.google.com/file/d/1certi/view', gen_random_uuid(), 'c8888888-8888-8888-8888-888888888888', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
('pj111111-1111-1111-1111-111111111111', 'Ascensores de Alta Velocidad', 'ThyssenKrupp', '2024-04-25', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pj111111', 'https://docs.google.com/document/d/1examplej/edit', 'https://drive.google.com/file/d/1certj/view', gen_random_uuid(), 'c8888888-8888-8888-8888-888888888888', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),

-- Productos adicionales para mayor diversidad
('pk222222-2222-2222-2222-222222222222', 'Panel Solar Fotovoltaico 500W', 'Q CELLS Argentina', '2024-05-01', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pk222222', 'https://docs.google.com/document/d/1examplek/edit', 'https://drive.google.com/file/d/1certk/view', gen_random_uuid(), 'c9999999-9999-9999-9999-999999999999', 'gggggggg-gggg-gggg-gggg-gggggggggggg'),
('pl333333-3333-3333-3333-333333333333', 'Inversor Solar Trifásico', 'SMA Solar Technology', '2024-05-05', NULL, 'https://docs.google.com/document/d/1examplel/edit', NULL, gen_random_uuid(), 'c9999999-9999-9999-9999-999999999999', 'gggggggg-gggg-gggg-gggg-gggggggggggg'),
('pm444444-4444-4444-4444-444444444444', 'Sistema de Monitoreo IoT', 'Schneider Electric IoT', '2024-05-10', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pm444444', NULL, 'https://drive.google.com/file/d/1certm/view', gen_random_uuid(), 'ca111111-1111-1111-1111-111111111111', 'gggggggg-gggg-gggg-gggg-gggggggggggg'),
('pn555555-5555-5555-5555-555555555555', 'Cargador de Vehículos Eléctricos', 'ABB E-mobility', '2024-05-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pn555555', 'https://docs.google.com/document/d/1examplen/edit', 'https://drive.google.com/file/d/1certn/view', gen_random_uuid(), 'ca111111-1111-1111-1111-111111111111', 'gggggggg-gggg-gggg-gggg-gggggggggggg'),

-- Productos de Clínica Privada
('po666666-6666-6666-6666-666666666666', 'Equipo de Rayos X Digital', 'General Electric Healthcare', '2024-05-20', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=po666666', 'https://docs.google.com/document/d/1exampleo/edit', 'https://drive.google.com/file/d/1certo/view', gen_random_uuid(), 'cb222222-2222-2222-2222-222222222222', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),
('pp777777-7777-7777-7777-777777777777', 'Resonador Magnético', 'Siemens Healthineers', '2024-05-25', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pp777777', NULL, 'https://drive.google.com/file/d/1certp/view', gen_random_uuid(), 'cb222222-2222-2222-2222-222222222222', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),

-- Productos de Planta Química
('pq888888-8888-8888-8888-888888888888', 'Reactor Químico Automatizado', 'Emerson Process Management', '2024-06-01', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pq888888', 'https://docs.google.com/document/d/1exampleq/edit', 'https://drive.google.com/file/d/1certq/view', gen_random_uuid(), 'cc333333-3333-3333-3333-333333333333', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),
('pr999999-9999-9999-9999-999999999999', 'Sistema de Control DCS', 'Honeywell Process Solutions', '2024-06-05', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pr999999', 'https://docs.google.com/document/d/1exampler/edit', NULL, gen_random_uuid(), 'cc333333-3333-3333-3333-333333333333', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),
('ps111111-1111-1111-1111-111111111111', 'Bomba Centrífuga de Alta Presión', 'Grundfos Argentina', '2024-06-10', NULL, 'https://docs.google.com/document/d/1examples/edit', 'https://drive.google.com/file/d/1certs/view', gen_random_uuid(), 'cc333333-3333-3333-3333-333333333333', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),
('pt222222-2222-2222-2222-222222222222', 'Variador de Frecuencia 75HP', 'Danfoss Argentina', '2024-06-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pt222222', NULL, NULL, gen_random_uuid(), 'cc333333-3333-3333-3333-333333333333', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh');

-- Add some products with DJC firmada URLs to test the DJC module
UPDATE productos SET djc_firmada_url = 'https://docs.google.com/document/d/1signed1/view' 
WHERE id = 'p1111111-1111-1111-1111-111111111111';

UPDATE productos SET djc_firmada_url = 'https://docs.google.com/document/d/1signed4/view' 
WHERE id = 'p4444444-4444-4444-4444-444444444444';

UPDATE productos SET djc_firmada_url = 'https://docs.google.com/document/d/1signed6/view' 
WHERE id = 'p6666666-6666-6666-6666-666666666666';

UPDATE productos SET djc_firmada_url = 'https://docs.google.com/document/d/1signed9/view' 
WHERE id = 'p9999999-9999-9999-9999-999999999999';

UPDATE productos SET djc_firmada_url = 'https://docs.google.com/document/d/1signedb/view' 
WHERE id = 'pb222222-2222-2222-2222-222222222222';

-- Update user profiles with signature URLs for some clients (for DJC generation)
UPDATE user_profiles SET firma_png_url = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=100&fit=crop&crop=center'
WHERE id = 'c1111111-1111-1111-1111-111111111111';

UPDATE user_profiles SET firma_png_url = 'https://images.unsplash.com/photo-1494790108755-2616b332c3f1?w=200&h=100&fit=crop&crop=center'
WHERE id = 'c3333333-3333-3333-3333-333333333333';

UPDATE user_profiles SET firma_png_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=100&fit=crop&crop=center'
WHERE id = 'c5555555-5555-5555-5555-555555555555';