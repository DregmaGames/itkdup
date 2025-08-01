/*
  # Fix productos relationships for clientes module

  1. Actualizar relación FK
    - Mantener productos.cliente_id → user_profiles(id) ya que es donde están los IDs de usuarios
    - Esto es correcto porque clientes.user_id también apunta a user_profiles(id)

  2. Verificar índices y datos
    - Asegurar que los índices existan
    - Verificar que hay datos de ejemplo

  3. Políticas RLS
    - Ya están configuradas correctamente
*/

-- Verificar que la relación FK existe (ya debería existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'productos_cliente_id_fkey'
  ) THEN
    ALTER TABLE productos 
    ADD CONSTRAINT productos_cliente_id_fkey 
    FOREIGN KEY (cliente_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verificar que la relación con consultor también existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'productos_consultor_id_fkey'
  ) THEN
    ALTER TABLE productos 
    ADD CONSTRAINT productos_consultor_id_fkey 
    FOREIGN KEY (consultor_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Asegurar que los índices existen
CREATE INDEX IF NOT EXISTS idx_productos_cliente_id ON productos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_productos_consultor_id ON productos(consultor_id);
CREATE INDEX IF NOT EXISTS idx_productos_fecha ON productos(fecha);

-- Verificar datos de ejemplo y agregar más si es necesario
DO $$
DECLARE
  cliente_user_id uuid;
  consultor_user_id uuid;
  product_count integer;
BEGIN
  -- Contar productos existentes
  SELECT COUNT(*) INTO product_count FROM productos;
  
  -- Solo agregar más productos si hay pocos
  IF product_count < 5 THEN
    
    -- Obtener IDs de usuario cliente y consultor
    SELECT id INTO cliente_user_id FROM user_profiles WHERE role = 'Cliente' LIMIT 1;
    SELECT id INTO consultor_user_id FROM user_profiles WHERE role = 'Consultor' LIMIT 1;
    
    -- Agregar productos adicionales si existen los usuarios
    IF cliente_user_id IS NOT NULL THEN
      INSERT INTO productos (nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id) VALUES
        ('Smartphone ProMax', 'TechCorp', CURRENT_DATE - INTERVAL '10 days', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-SM001', 'https://example.com/djc/smartphone.pdf', 'https://example.com/cert/smartphone.pdf', cliente_user_id, consultor_user_id),
        ('Laptop Empresarial', 'CompuTech', CURRENT_DATE - INTERVAL '25 days', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-LP002', 'https://example.com/djc/laptop.pdf', NULL, cliente_user_id, consultor_user_id),
        ('Monitor 4K Ultra', 'DisplayMax', CURRENT_DATE - INTERVAL '40 days', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-MN003', NULL, 'https://example.com/cert/monitor.pdf', cliente_user_id, consultor_user_id),
        ('Teclado Mecánico RGB', 'KeyboardPro', CURRENT_DATE - INTERVAL '55 days', NULL, 'https://example.com/djc/keyboard.pdf', 'https://example.com/cert/keyboard.pdf', cliente_user_id, consultor_user_id),
        ('Mouse Gaming Wireless', 'MouseTech', CURRENT_DATE - INTERVAL '70 days', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-MS005', 'https://example.com/djc/mouse.pdf', 'https://example.com/cert/mouse.pdf', cliente_user_id, consultor_user_id)
      ON CONFLICT DO NOTHING;
    END IF;
    
  END IF;
END $$;