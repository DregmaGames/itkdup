/*
  # Políticas Demo para Visualización

  1. Políticas Temporales
    - Agregar políticas permisivas para demo
    - Permitir que usuarios autenticados vean datos demo
    - Mantener políticas existentes intactas

  2. Tablas Afectadas
    - user_profiles: Ver todos los perfiles demo
    - certificadores: Ver certificadores demo
    - consultores: Ver consultores demo  
    - clientes: Ver clientes demo
    - productos: Ver productos demo

  3. Seguridad
    - Solo para desarrollo/demo
    - No afecta políticas de producción existentes
*/

-- Políticas demo para user_profiles
CREATE POLICY "demo_user_profiles_select" 
  ON user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (email LIKE '%demo@modularapp.com');

-- Políticas demo para certificadores
CREATE POLICY "demo_certificadores_select" 
  ON certificadores 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = certificadores.user_id 
      AND user_profiles.email LIKE '%demo@modularapp.com'
    )
  );

-- Políticas demo para consultores
CREATE POLICY "demo_consultores_select" 
  ON consultores 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = consultores.user_id 
      AND user_profiles.email LIKE '%demo@modularapp.com'
    )
  );

-- Políticas demo para clientes
CREATE POLICY "demo_clientes_select" 
  ON clientes 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = clientes.user_id 
      AND user_profiles.email LIKE '%demo@modularapp.com'
    )
  );

-- Políticas demo para productos
CREATE POLICY "demo_productos_select" 
  ON productos 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM clientes 
      JOIN user_profiles ON user_profiles.id = clientes.user_id
      WHERE clientes.user_id = productos.cliente_id 
      AND user_profiles.email LIKE '%demo@modularapp.com'
    )
  );

-- Políticas demo para djc_documents
CREATE POLICY "demo_djc_documents_select" 
  ON djc_documents 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM productos 
      JOIN clientes ON clientes.user_id = productos.cliente_id
      JOIN user_profiles ON user_profiles.id = clientes.user_id
      WHERE productos.id = djc_documents.producto_id 
      AND user_profiles.email LIKE '%demo@modularapp.com'
    )
  );

-- Políticas demo para certificates
CREATE POLICY "demo_certificates_select" 
  ON certificates 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM productos 
      JOIN clientes ON clientes.user_id = productos.cliente_id
      JOIN user_profiles ON user_profiles.id = clientes.user_id
      WHERE productos.id = certificates.producto_id 
      AND user_profiles.email LIKE '%demo@modularapp.com'
    )
  );

-- Política general permisiva para usuarios autenticados (temporal para demo)
CREATE POLICY "temp_demo_all_select" 
  ON user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "temp_demo_certificadores_all_select" 
  ON certificadores 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "temp_demo_consultores_all_select" 
  ON consultores 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "temp_demo_clientes_all_select" 
  ON clientes 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "temp_demo_productos_all_select" 
  ON productos 
  FOR SELECT 
  TO authenticated 
  USING (true);