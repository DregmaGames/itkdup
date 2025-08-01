/*
# Crear tabla de productos

1. Nueva tabla
   - `productos` con todos los campos necesarios
   - Referencias a user_profiles para cliente_id y consultor_id
   - Campos para documentos (QR, DJC, certificado)

2. Seguridad
   - Habilitar RLS en la tabla productos
   - Políticas por rol:
     - Admin: ve todos los productos
     - Cert: ve todos los productos
     - Consultor: ve solo productos asignados a él
     - Cliente: ve solo sus productos

3. Índices
   - Para mejorar performance en consultas por cliente_id, consultor_id y fecha

4. Trigger
   - Para actualizar automatically el campo updated_at
*/

-- Create productos table
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  fabricante text NOT NULL,
  fecha date NOT NULL,
  qr_code_url text,
  djc_url text,
  certificado_url text,
  cliente_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Policies for different roles
CREATE POLICY "Admins can read all products"
  ON productos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Cert users can read all products"
  ON productos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Cert'
    )
  );

CREATE POLICY "Consultants can read their assigned products"
  ON productos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Consultor'
    ) AND consultor_id = auth.uid()
  );

CREATE POLICY "Clients can read their own products"
  ON productos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Cliente'
    ) AND cliente_id = auth.uid()
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_productos_cliente_id ON productos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_productos_consultor_id ON productos(consultor_id);
CREATE INDEX IF NOT EXISTS idx_productos_fecha ON productos(fecha);

-- Trigger for auto-updating timestamp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_productos_updated') THEN
    CREATE TRIGGER on_productos_updated
      BEFORE UPDATE ON productos
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Insert sample products only if users exist and no products exist yet
DO $$
DECLARE
  cliente_id_var uuid;
  consultor_id_var uuid;
BEGIN
  -- Only proceed if no products exist yet
  IF NOT EXISTS (SELECT 1 FROM productos LIMIT 1) THEN
    
    -- Get existing user IDs if they exist
    SELECT id INTO cliente_id_var FROM user_profiles WHERE role = 'Cliente' LIMIT 1;
    SELECT id INTO consultor_id_var FROM user_profiles WHERE role = 'Consultor' LIMIT 1;
    
    -- Insert sample products only if we have at least a client user
    IF cliente_id_var IS NOT NULL THEN
      INSERT INTO productos (nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id) VALUES
        ('Producto Electrónico A1', 'Fabricante Alpha', CURRENT_DATE - INTERVAL '30 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-A1', 'https://example.com/djc/a1.pdf', 'https://example.com/cert/a1.pdf', cliente_id_var, consultor_id_var),
        ('Producto Mecánico B2', 'Fabricante Beta', CURRENT_DATE - INTERVAL '60 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-B2', 'https://example.com/djc/b2.pdf', NULL, cliente_id_var, consultor_id_var),
        ('Producto Químico C3', 'Fabricante Gamma', CURRENT_DATE - INTERVAL '90 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-C3', NULL, 'https://example.com/cert/c3.pdf', cliente_id_var, consultor_id_var),
        ('Producto Software D4', 'Fabricante Delta', CURRENT_DATE - INTERVAL '15 days', NULL, 'https://example.com/djc/d4.pdf', 'https://example.com/cert/d4.pdf', cliente_id_var, consultor_id_var),
        ('Producto Industrial E5', 'Fabricante Epsilon', CURRENT_DATE - INTERVAL '45 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-E5', 'https://example.com/djc/e5.pdf', 'https://example.com/cert/e5.pdf', cliente_id_var, consultor_id_var),
        ('Producto Textil F6', 'Fabricante Zeta', CURRENT_DATE - INTERVAL '75 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-F6', NULL, NULL, cliente_id_var, consultor_id_var),
        ('Producto Alimentario G7', 'Fabricante Eta', CURRENT_DATE - INTERVAL '20 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-G7', 'https://example.com/djc/g7.pdf', 'https://example.com/cert/g7.pdf', cliente_id_var, consultor_id_var),
        ('Producto Farmacéutico H8', 'Fabricante Theta', CURRENT_DATE - INTERVAL '10 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-H8', 'https://example.com/djc/h8.pdf', NULL, cliente_id_var, consultor_id_var),
        ('Producto Cosmético I9', 'Fabricante Iota', CURRENT_DATE - INTERVAL '100 days', NULL, 'https://example.com/djc/i9.pdf', 'https://example.com/cert/i9.pdf', cliente_id_var, consultor_id_var),
        ('Producto Automotriz J10', 'Fabricante Kappa', CURRENT_DATE - INTERVAL '5 days', 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=QR-J10', 'https://example.com/djc/j10.pdf', 'https://example.com/cert/j10.pdf', cliente_id_var, consultor_id_var);
    END IF;
    
  END IF;
END $$;