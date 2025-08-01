/*
  # Add missing columns and create demo users

  1. Schema Updates
    - Add `activo` column to clientes, consultores tables
    - Add `consultor_id` column to productos table
    - Add `empresa` column to consultores table for backward compatibility

  2. Demo Users
    - Create 4 demo users with proper hierarchy
    - Admin → Cert → Consultor → Cliente
    - Add sample products

  3. Security
    - Ensure RLS policies allow demo access
*/

-- Add missing columns
DO $$
BEGIN
  -- Add activo column to clientes if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'activo'
  ) THEN
    ALTER TABLE clientes ADD COLUMN activo boolean DEFAULT true;
  END IF;

  -- Add activo column to consultores if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultores' AND column_name = 'activo'
  ) THEN
    ALTER TABLE consultores ADD COLUMN activo boolean DEFAULT true;
  END IF;

  -- Add activo column to certificadores if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificadores' AND column_name = 'activo'
  ) THEN
    ALTER TABLE certificadores ADD COLUMN activo boolean DEFAULT true;
  END IF;

  -- Add consultor_id column to productos if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'consultor_id'
  ) THEN
    ALTER TABLE productos ADD COLUMN consultor_id uuid REFERENCES consultores(id) ON DELETE SET NULL;
  END IF;

  -- Add empresa column to consultores for backward compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultores' AND column_name = 'empresa'
  ) THEN
    ALTER TABLE consultores ADD COLUMN empresa text;
    -- Copy company_name to empresa
    UPDATE consultores SET empresa = company_name WHERE company_name IS NOT NULL;
  END IF;

  -- Add empresa column to clientes for backward compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'empresa'
  ) THEN
    ALTER TABLE clientes ADD COLUMN empresa text;
    -- Copy company_name to empresa
    UPDATE clientes SET empresa = company_name WHERE company_name IS NOT NULL;
  END IF;

  -- Add legacy columns for clientes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'cuit'
  ) THEN
    ALTER TABLE clientes ADD COLUMN cuit text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'razon_social'
  ) THEN
    ALTER TABLE clientes ADD COLUMN razon_social text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'nombre_comercial'
  ) THEN
    ALTER TABLE clientes ADD COLUMN nombre_comercial text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'telefono'
  ) THEN
    ALTER TABLE clientes ADD COLUMN telefono text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'direccion'
  ) THEN
    ALTER TABLE clientes ADD COLUMN direccion text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE clientes ADD COLUMN avatar text;
  END IF;

  -- Add legacy columns for consultores
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultores' AND column_name = 'especialidad'
  ) THEN
    ALTER TABLE consultores ADD COLUMN especialidad text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultores' AND column_name = 'telefono'
  ) THEN
    ALTER TABLE consultores ADD COLUMN telefono text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultores' AND column_name = 'direccion'
  ) THEN
    ALTER TABLE consultores ADD COLUMN direccion text;
  END IF;

  -- Add legacy columns for certificadores
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificadores' AND column_name = 'empresa'
  ) THEN
    ALTER TABLE certificadores ADD COLUMN empresa text;
    -- Copy company_name to empresa
    UPDATE certificadores SET empresa = company_name WHERE company_name IS NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificadores' AND column_name = 'especialidad'
  ) THEN
    ALTER TABLE certificadores ADD COLUMN especialidad text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificadores' AND column_name = 'telefono'
  ) THEN
    ALTER TABLE certificadores ADD COLUMN telefono text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificadores' AND column_name = 'direccion'
  ) THEN
    ALTER TABLE certificadores ADD COLUMN direccion text;
  END IF;

  -- Update productos table to match expected schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'nombre'
  ) THEN
    ALTER TABLE productos ADD COLUMN nombre text;
    -- Copy name to nombre
    UPDATE productos SET nombre = name WHERE name IS NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'fabricante'
  ) THEN
    ALTER TABLE productos ADD COLUMN fabricante text;
    -- Set default fabricante
    UPDATE productos SET fabricante = COALESCE(brand, 'Fabricante no especificado') WHERE fabricante IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'fecha'
  ) THEN
    ALTER TABLE productos ADD COLUMN fecha date DEFAULT CURRENT_DATE;
    -- Set fecha from created_at
    UPDATE productos SET fecha = created_at::date WHERE fecha IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'djc_url'
  ) THEN
    ALTER TABLE productos ADD COLUMN djc_url text;
    -- Copy djc_document_url to djc_url
    UPDATE productos SET djc_url = djc_document_url WHERE djc_document_url IS NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'certificado_url'
  ) THEN
    ALTER TABLE productos ADD COLUMN certificado_url text;
    -- Copy certificate_url to certificado_url
    UPDATE productos SET certificado_url = certificate_url WHERE certificate_url IS NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'djc_firmada_url'
  ) THEN
    ALTER TABLE productos ADD COLUMN djc_firmada_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'public_id'
  ) THEN
    ALTER TABLE productos ADD COLUMN public_id text UNIQUE;
    -- Generate public_id for existing products
    UPDATE productos SET public_id = gen_random_uuid()::text WHERE public_id IS NULL;
  END IF;
END $$;

-- Insert demo users with fixed IDs
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
VALUES 
  ('a1000000-0000-0000-0000-000000000001', 'admin@demo.modularapp.com', 'Admin', 'Admin Demo', now(), now()),
  ('c2000000-0000-0000-0000-000000000001', 'cert@demo.modularapp.com', 'Cert', 'Certificador Demo', now(), now()),
  ('c1000000-0000-0000-0000-000000000001', 'consultor@demo.modularapp.com', 'Consultor', 'Consultor Demo', now(), now()),
  ('u1000000-0000-0000-0000-000000000001', 'cliente@demo.modularapp.com', 'Cliente', 'Cliente Demo', now(), now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = now();

-- Insert certificador demo
INSERT INTO certificadores (id, user_id, company_name, empresa, especialidad, telefono, direccion, activo, created_at, updated_at)
VALUES (
  'cert0000-0000-0000-0000-000000000001',
  'c2000000-0000-0000-0000-000000000001',
  'Certificadora Demo S.A.',
  'Certificadora Demo S.A.',
  'Certificación Eléctrica',
  '+54 11 1234-5678',
  'Av. Certificación 123, CABA',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  empresa = EXCLUDED.empresa,
  especialidad = EXCLUDED.especialidad,
  telefono = EXCLUDED.telefono,
  direccion = EXCLUDED.direccion,
  activo = EXCLUDED.activo,
  updated_at = now();

-- Insert consultor demo
INSERT INTO consultores (id, user_id, certificador_id, company_name, empresa, especialidad, telefono, direccion, activo, created_at, updated_at)
VALUES (
  'cons0000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'cert0000-0000-0000-0000-000000000001',
  'Consultoría Demo S.R.L.',
  'Consultoría Demo S.R.L.',
  'Asesoría Técnica',
  '+54 11 9876-5432',
  'Av. Consultoría 456, CABA',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  certificador_id = EXCLUDED.certificador_id,
  company_name = EXCLUDED.company_name,
  empresa = EXCLUDED.empresa,
  especialidad = EXCLUDED.especialidad,
  telefono = EXCLUDED.telefono,
  direccion = EXCLUDED.direccion,
  activo = EXCLUDED.activo,
  updated_at = now();

-- Insert cliente demo
INSERT INTO clientes (id, user_id, consultor_id, company_name, empresa, sector, cuit, razon_social, nombre_comercial, telefono, direccion, activo, created_at, updated_at)
VALUES (
  'cli00000-0000-0000-0000-000000000001',
  'u1000000-0000-0000-0000-000000000001',
  'cons0000-0000-0000-0000-000000000001',
  'Cliente Demo S.A.',
  'Cliente Demo S.A.',
  'Manufactura',
  '20-12345678-9',
  'Cliente Demo S.A.',
  'Demo Corp',
  '+54 11 5555-1234',
  'Av. Cliente 789, CABA',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  consultor_id = EXCLUDED.consultor_id,
  company_name = EXCLUDED.company_name,
  empresa = EXCLUDED.empresa,
  sector = EXCLUDED.sector,
  cuit = EXCLUDED.cuit,
  razon_social = EXCLUDED.razon_social,
  nombre_comercial = EXCLUDED.nombre_comercial,
  telefono = EXCLUDED.telefono,
  direccion = EXCLUDED.direccion,
  activo = EXCLUDED.activo,
  updated_at = now();

-- Insert sample productos
INSERT INTO productos (id, cliente_id, consultor_id, name, nombre, brand, fabricante, fecha, qr_code_url, djc_url, certificado_url, public_id, status, created_at, updated_at)
VALUES 
  (
    'prod0001-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Motor Eléctrico 1HP',
    'Motor Eléctrico 1HP',
    'MotorTech',
    'MotorTech S.A.',
    '2024-01-15',
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD001',
    'https://example.com/djc/motor-1hp.pdf',
    'https://example.com/cert/motor-1hp.pdf',
    'public-motor-1hp-001',
    'active',
    now(),
    now()
  ),
  (
    'prod0002-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Tablero Eléctrico Industrial',
    'Tablero Eléctrico Industrial',
    'ElectroPanel',
    'ElectroPanel Ltda.',
    '2024-01-20',
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD002',
    NULL,
    'https://example.com/cert/tablero-industrial.pdf',
    'public-tablero-industrial-002',
    'active',
    now(),
    now()
  ),
  (
    'prod0003-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Transformador 220V/110V',
    'Transformador 220V/110V',
    'TransforTech',
    'TransforTech Corp.',
    '2024-01-25',
    NULL,
    'https://example.com/djc/transformador-220-110.pdf',
    NULL,
    'public-transformador-220-110-003',
    'active',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  nombre = EXCLUDED.nombre,
  brand = EXCLUDED.brand,
  fabricante = EXCLUDED.fabricante,
  fecha = EXCLUDED.fecha,
  qr_code_url = EXCLUDED.qr_code_url,
  djc_url = EXCLUDED.djc_url,
  certificado_url = EXCLUDED.certificado_url,
  public_id = EXCLUDED.public_id,
  updated_at = now();

-- Create or update the public view for productos
DROP VIEW IF EXISTS public_productos;
CREATE VIEW public_productos AS
SELECT 
  public_id,
  nombre,
  fabricante,
  fecha::text as fecha,
  qr_code_url,
  djc_url,
  certificado_url,
  created_at,
  updated_at
FROM productos 
WHERE public_id IS NOT NULL 
AND status = 'active';

-- Ensure RLS policies are permissive for demo
DO $$
BEGIN
  -- Drop existing restrictive policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

  -- Create very permissive demo policies
  CREATE POLICY "Demo - Allow all operations on user_profiles"
    ON user_profiles FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

  -- Similar for other tables
  DROP POLICY IF EXISTS "Certificadores can read own data" ON certificadores;
  DROP POLICY IF EXISTS "Admins can read all certificadores" ON certificadores;
  
  CREATE POLICY "Demo - Allow all operations on certificadores"
    ON certificadores FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Consultores can read own data" ON consultores;
  DROP POLICY IF EXISTS "Admins can read all consultores" ON consultores;
  DROP POLICY IF EXISTS "Certificadores can read their consultores" ON consultores;
  
  CREATE POLICY "Demo - Allow all operations on consultores"
    ON consultores FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Clientes can read own data" ON clientes;
  DROP POLICY IF EXISTS "Admins can read all clientes" ON clientes;
  DROP POLICY IF EXISTS "Certificadores can read clientes through consultores" ON clientes;
  DROP POLICY IF EXISTS "Consultores can read their clientes" ON clientes;
  
  CREATE POLICY "Demo - Allow all operations on clientes"
    ON clientes FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
END $$;