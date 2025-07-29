/*
  # Configurar acceso público a productos

  1. Nuevos campos en tabla productos
    - `public_id` (uuid, único) - Identificador público para acceso sin autenticación
    - Índice único para consultas rápidas

  2. Política de seguridad pública
    - Permitir acceso de solo lectura por public_id
    - Sin autenticación requerida

  3. Datos de ejemplo
    - Generar public_id para productos existentes
*/

-- Agregar campo public_id a productos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'public_id'
  ) THEN
    ALTER TABLE productos ADD COLUMN public_id uuid DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Crear índice único para public_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_public_id ON productos(public_id);

-- Generar public_id para productos existentes que no lo tengan
UPDATE productos 
SET public_id = gen_random_uuid() 
WHERE public_id IS NULL;

-- Hacer que public_id sea NOT NULL después de generar valores
ALTER TABLE productos ALTER COLUMN public_id SET NOT NULL;

-- Crear política pública para acceso sin autenticación
CREATE POLICY "Public access by public_id"
  ON productos
  FOR SELECT
  TO anon
  USING (public_id IS NOT NULL);

-- Asegurar que la política anónima esté habilitada
GRANT SELECT ON productos TO anon;

-- Opcional: Crear vista pública simplificada (recomendado para seguridad)
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

-- Permitir acceso anónimo a la vista
GRANT SELECT ON public_productos TO anon;

-- Insertar datos de ejemplo adicionales con public_id
DO $$
DECLARE
  cliente_id_var uuid;
  consultor_id_var uuid;
  product_count integer;
BEGIN
  -- Contar productos actuales
  SELECT COUNT(*) INTO product_count FROM productos;
  
  -- Solo agregar más productos si hay pocos
  IF product_count < 10 THEN
    
    -- Obtener IDs de usuario
    SELECT id INTO cliente_id_var FROM user_profiles WHERE role = 'Cliente' LIMIT 1;
    SELECT id INTO consultor_id_var FROM user_profiles WHERE role = 'Consultor' LIMIT 1;
    
    -- Insertar productos adicionales con public_id
    IF cliente_id_var IS NOT NULL THEN
      INSERT INTO productos (
        public_id,
        nombre, 
        fabricante, 
        fecha, 
        qr_code_url, 
        djc_url, 
        certificado_url, 
        cliente_id, 
        consultor_id
      ) VALUES
        (
          gen_random_uuid(),
          'Sistema de Seguridad ProTech', 
          'SecureTech Solutions', 
          CURRENT_DATE - INTERVAL '15 days',
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-SEC001',
          'https://example.com/djc/security-system.pdf',
          'https://example.com/cert/security-system.pdf',
          cliente_id_var, 
          consultor_id_var
        ),
        (
          gen_random_uuid(),
          'Panel Solar Eficiente 400W', 
          'GreenEnergy Corp', 
          CURRENT_DATE - INTERVAL '30 days',
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-SOL002',
          'https://example.com/djc/solar-panel.pdf',
          'https://example.com/cert/solar-panel.pdf',
          cliente_id_var, 
          consultor_id_var
        ),
        (
          gen_random_uuid(),
          'Bomba de Agua Industrial', 
          'HydroTech Industries', 
          CURRENT_DATE - INTERVAL '45 days',
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-PMP003',
          'https://example.com/djc/water-pump.pdf',
          NULL,
          cliente_id_var, 
          consultor_id_var
        )
      ON CONFLICT DO NOTHING;
    END IF;
    
  END IF;
END $$;

-- Mostrar algunos public_id de ejemplo para testing
DO $$
DECLARE
  sample_public_ids text;
BEGIN
  SELECT string_agg(public_id::text, ', ') INTO sample_public_ids
  FROM (
    SELECT public_id FROM productos LIMIT 3
  ) sample;
  
  IF sample_public_ids IS NOT NULL THEN
    RAISE NOTICE 'Public IDs de ejemplo para testing:';
    RAISE NOTICE '%', sample_public_ids;
    RAISE NOTICE 'URL de ejemplo: /products/%', split_part(sample_public_ids, ', ', 1);
  END IF;
END $$;