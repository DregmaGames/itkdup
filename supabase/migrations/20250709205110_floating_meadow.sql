/*
  # Crear estructura jerárquica para el módulo de administrador

  1. Nuevas Tablas
    - `certificadores` - Información extendida de certificadores
    - `consultores` - Información extendida de consultores con certificador asignado
    - `clientes` - Información extendida de clientes con consultor asignado

  2. Relaciones Jerárquicas
    - consultor.certificador_id → certificadores.user_id
    - cliente.consultor_id → consultores.user_id
    - producto.cliente_id → clientes.user_id (ya existe)

  3. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para que Admin acceda a todo
    - Políticas específicas para cada rol
*/

-- Tabla de certificadores (extiende user_profiles con role = 'Cert')
CREATE TABLE IF NOT EXISTS certificadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  empresa text,
  especialidad text,
  telefono text,
  direccion text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de consultores (extiende user_profiles con role = 'Consultor')
CREATE TABLE IF NOT EXISTS consultores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  certificador_id uuid REFERENCES certificadores(id) ON DELETE SET NULL,
  empresa text,
  especialidad text,
  telefono text,
  direccion text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de clientes (extiende user_profiles con role = 'Cliente')
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  consultor_id uuid REFERENCES consultores(id) ON DELETE SET NULL,
  empresa text,
  sector text,
  telefono text,
  direccion text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE certificadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para certificadores
CREATE POLICY "Admins can read all certificadores"
  ON certificadores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Certificadores can read own data"
  ON certificadores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Cert'
    ) AND user_id = auth.uid()
  );

-- Políticas para consultores
CREATE POLICY "Admins can read all consultores"
  ON consultores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Certificadores can read their consultores"
  ON consultores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN certificadores c ON c.user_id = up.id
      WHERE up.id = auth.uid() AND up.role = 'Cert' AND c.id = consultores.certificador_id
    )
  );

CREATE POLICY "Consultores can read own data"
  ON consultores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Consultor'
    ) AND user_id = auth.uid()
  );

-- Políticas para clientes
CREATE POLICY "Admins can read all clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Certificadores can read clientes through consultores"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN certificadores cert ON cert.user_id = up.id
      JOIN consultores cons ON cons.certificador_id = cert.id
      WHERE up.id = auth.uid() AND up.role = 'Cert' AND cons.id = clientes.consultor_id
    )
  );

CREATE POLICY "Consultores can read their clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN consultores cons ON cons.user_id = up.id
      WHERE up.id = auth.uid() AND up.role = 'Consultor' AND cons.id = clientes.consultor_id
    )
  );

CREATE POLICY "Clientes can read own data"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Cliente'
    ) AND user_id = auth.uid()
  );

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_certificadores_user_id ON certificadores(user_id);
CREATE INDEX IF NOT EXISTS idx_consultores_user_id ON consultores(user_id);
CREATE INDEX IF NOT EXISTS idx_consultores_certificador_id ON consultores(certificador_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_consultor_id ON clientes(consultor_id);

-- Triggers para timestamps
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_certificadores_updated') THEN
    CREATE TRIGGER on_certificadores_updated
      BEFORE UPDATE ON certificadores
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_consultores_updated') THEN
    CREATE TRIGGER on_consultores_updated
      BEFORE UPDATE ON consultores
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_clientes_updated') THEN
    CREATE TRIGGER on_clientes_updated
      BEFORE UPDATE ON clientes
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Datos de ejemplo (solo si no existen)
DO $$
DECLARE
  cert_user_id uuid;
  cons_user_id uuid;
  client_user_id uuid;
  cert_id uuid;
  cons_id uuid;
BEGIN
  -- Solo proceder si no hay datos existentes
  IF NOT EXISTS (SELECT 1 FROM certificadores LIMIT 1) THEN
    
    -- Buscar usuarios existentes
    SELECT id INTO cert_user_id FROM user_profiles WHERE role = 'Cert' LIMIT 1;
    SELECT id INTO cons_user_id FROM user_profiles WHERE role = 'Consultor' LIMIT 1;
    SELECT id INTO client_user_id FROM user_profiles WHERE role = 'Cliente' LIMIT 1;
    
    -- Insertar certificador si existe user_profile
    IF cert_user_id IS NOT NULL THEN
      INSERT INTO certificadores (user_id, empresa, especialidad, telefono, direccion)
      VALUES (cert_user_id, 'Certificadora Premium', 'Certificación Industrial', '+1234567890', 'Av. Principal 123')
      RETURNING id INTO cert_id;
    END IF;
    
    -- Insertar consultor si existe user_profile
    IF cons_user_id IS NOT NULL THEN
      INSERT INTO consultores (user_id, certificador_id, empresa, especialidad, telefono, direccion)
      VALUES (cons_user_id, cert_id, 'Consultoría Especializada', 'Consultoría Técnica', '+1234567891', 'Calle Secundaria 456')
      RETURNING id INTO cons_id;
    END IF;
    
    -- Insertar cliente si existe user_profile
    IF client_user_id IS NOT NULL THEN
      INSERT INTO clientes (user_id, consultor_id, empresa, sector, telefono, direccion)
      VALUES (client_user_id, cons_id, 'Empresa Cliente', 'Manufactura', '+1234567892', 'Zona Industrial 789');
    END IF;
    
  END IF;
END $$;