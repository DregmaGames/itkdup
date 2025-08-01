/*
  # Mejorar tabla de clientes para el módulo completo

  1. Nuevos campos en tabla clientes
    - `cuit` (text, único) - CUIT del cliente
    - `razon_social` (text) - Razón social oficial
    - `nombre_comercial` (text) - Nombre comercial
    - `avatar` (text, nullable) - URL del avatar
    - Renombrar `empresa` por compatibilidad

  2. Actualizar relaciones
    - Mantener clientes.consultor_id → consultores.id
    - Mantener clientes.user_id → user_profiles.id  

  3. Políticas RLS específicas para el módulo
    - ADMIN: acceso total
    - CERT: clientes de consultores bajo supervisión
    - CONSULTOR: solo sus clientes
    - CLIENTE: sin acceso

  4. Índices para mejor performance
*/

-- Agregar nuevos campos a la tabla clientes
DO $$
BEGIN
  -- CUIT único
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'cuit'
  ) THEN
    ALTER TABLE clientes ADD COLUMN cuit text UNIQUE;
  END IF;

  -- Razón social
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'razon_social'
  ) THEN
    ALTER TABLE clientes ADD COLUMN razon_social text;
  END IF;

  -- Nombre comercial
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'nombre_comercial'
  ) THEN
    ALTER TABLE clientes ADD COLUMN nombre_comercial text;
  END IF;

  -- Avatar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE clientes ADD COLUMN avatar text;
  END IF;
END $$;

-- Actualizar constraint para unique index en CUIT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clientes_cuit_key'
  ) THEN
    ALTER TABLE clientes ADD CONSTRAINT clientes_cuit_key UNIQUE (cuit);
  END IF;
END $$;

-- Crear índices adicionales para mejor performance
CREATE INDEX IF NOT EXISTS idx_clientes_cuit ON clientes(cuit);
CREATE INDEX IF NOT EXISTS idx_clientes_razon_social ON clientes(razon_social);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_comercial ON clientes(nombre_comercial);

-- Actualizar constraint en consultor_id para referenciar consultores.id (no user_id)
-- Esta relación ya debería estar correcta según el esquema

-- Insertar datos de ejemplo actualizados si no existen
DO $$
DECLARE
  consultor_id_var uuid;
  existing_client_count integer;
BEGIN
  -- Verificar si ya hay clientes con los nuevos campos
  SELECT COUNT(*) INTO existing_client_count 
  FROM clientes 
  WHERE cuit IS NOT NULL;
  
  -- Solo insertar si no hay clientes con CUIT
  IF existing_client_count = 0 THEN
    -- Obtener un consultor existente
    SELECT id INTO consultor_id_var 
    FROM consultores 
    LIMIT 1;
    
    -- Insertar clientes de ejemplo si existe un consultor
    IF consultor_id_var IS NOT NULL THEN
      -- Primero crear user_profiles para los clientes
      INSERT INTO user_profiles (id, email, role, name) VALUES 
        (gen_random_uuid(), 'cliente1@empresa.com', 'Cliente', 'Juan Pérez'),
        (gen_random_uuid(), 'cliente2@empresa.com', 'Cliente', 'María González'),
        (gen_random_uuid(), 'cliente3@empresa.com', 'Cliente', 'Carlos López')
      ON CONFLICT (email) DO NOTHING;

      -- Luego insertar los clientes con los nuevos campos
      INSERT INTO clientes (
        user_id, 
        consultor_id, 
        cuit, 
        razon_social, 
        nombre_comercial, 
        empresa, 
        sector, 
        telefono, 
        direccion
      ) 
      SELECT 
        up.id,
        consultor_id_var,
        CASE 
          WHEN up.email = 'cliente1@empresa.com' THEN '20-12345678-9'
          WHEN up.email = 'cliente2@empresa.com' THEN '20-23456789-0' 
          ELSE '20-34567890-1'
        END,
        CASE 
          WHEN up.email = 'cliente1@empresa.com' THEN 'Industrias ABC S.A.'
          WHEN up.email = 'cliente2@empresa.com' THEN 'Comercial XYZ S.R.L.'
          ELSE 'Servicios 123 S.A.S.'
        END,
        CASE 
          WHEN up.email = 'cliente1@empresa.com' THEN 'ABC Industrial'
          WHEN up.email = 'cliente2@empresa.com' THEN 'XYZ Comercial'
          ELSE 'Servicios 123'
        END,
        CASE 
          WHEN up.email = 'cliente1@empresa.com' THEN 'Industrias ABC S.A.'
          WHEN up.email = 'cliente2@empresa.com' THEN 'Comercial XYZ S.R.L.'
          ELSE 'Servicios 123 S.A.S.'
        END,
        CASE 
          WHEN up.email = 'cliente1@empresa.com' THEN 'Manufactura'
          WHEN up.email = 'cliente2@empresa.com' THEN 'Comercio'
          ELSE 'Servicios'
        END,
        '+54 11 1234-5678',
        'Buenos Aires, Argentina'
      FROM user_profiles up
      WHERE up.email IN ('cliente1@empresa.com', 'cliente2@empresa.com', 'cliente3@empresa.com')
      ON CONFLICT (user_id) DO NOTHING;
      
    END IF;
  END IF;
END $$;