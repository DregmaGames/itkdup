/*
  # Datos de Demostración - Sistema Jerárquico Completo

  Esta migración crea datos de prueba para demostrar el funcionamiento completo del sistema jerárquico:

  1. Perfiles de Usuario
     - Admin demo
     - Certificador demo
     - Consultor demo
     - Cliente demo

  2. Relaciones Jerárquicas
     - Admin gestiona todo
     - Certificador supervisa al Consultor
     - Consultor gestiona al Cliente
     - Cliente tiene productos

  3. Productos Demo
     - Producto con documentos completos
     - URLs de documentos simuladas
     - QR code y certificados

  4. Seguridad
     - Todos los registros respetan las políticas RLS existentes
     - Datos consistentes para testing
*/

-- 1. Crear usuarios de perfil demo
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin.demo@modularapp.com', 'Admin', 'Administrador Demo', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'cert.demo@modularapp.com', 'Cert', 'Certificador Demo SA', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'consultor.demo@modularapp.com', 'Consultor', 'Consultor Demo Ltda', now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'cliente.demo@modularapp.com', 'Cliente', 'Empresa Cliente Demo', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Crear perfil de certificador
INSERT INTO certificadores (id, user_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Certificadora Demo SA', 'Productos Eléctricos', '+54 11 4000-0001', 'Av. Corrientes 1234, CABA', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Crear perfil de consultor
INSERT INTO consultores (id, user_id, certificador_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consultoría Demo Ltda', 'Asesoramiento Técnico', '+54 11 4000-0002', 'Av. Santa Fe 5678, CABA', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 4. Crear perfil de cliente
INSERT INTO clientes (id, user_id, consultor_id, cuit, razon_social, nombre_comercial, empresa, sector, telefono, direccion, activo, created_at, updated_at) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '20-12345678-9', 'Empresa Cliente Demo SA', 'Cliente Demo', 'Empresa Cliente Demo SA', 'Manufactura', '+54 11 4000-0003', 'Av. Rivadavia 9012, CABA', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. Crear productos demo con documentos completos
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, public_id, created_at, updated_at) VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Motor Eléctrico Trifásico 5HP',
    'Fabricante Demo Industrial',
    '2024-01-15',
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/products/dddddddd-dddd-dddd-dddd-dddddddddddd',
    'https://drive.google.com/file/d/1example-djc-document/view',
    'https://drive.google.com/file/d/1example-certificate/view',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    now(),
    now()
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Tablero Eléctrico 400A',
    'Tableros Demo Corp',
    '2024-01-20',
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://modularapp.com/products/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    NULL,
    'https://drive.google.com/file/d/1example-certificate-2/view',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    now(),
    now()
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Interruptor Termomagnético 63A',
    'Protecciones Demo SA',
    '2024-01-25',
    NULL,
    'https://drive.google.com/file/d/1example-djc-document-3/view',
    NULL,
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Crear admin demo en tabla admins (si se usa)
INSERT INTO admins (id, user_id, email, name, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin.demo@modularapp.com', 'Administrador Demo', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. Crear algunos documentos DJC demo
INSERT INTO djc_documents (id, producto_id, file_url, uploaded_by, uploaded_at) VALUES
  ('doc11111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://drive.google.com/file/d/1example-djc-document/view', '44444444-4444-4444-4444-444444444444', now()),
  ('doc22222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://drive.google.com/file/d/1example-djc-document-3/view', '44444444-4444-4444-4444-444444444444', now())
ON CONFLICT (id) DO NOTHING;

-- 8. Crear algunos certificados demo
INSERT INTO certificates (id, producto_id, file_url, uploaded_by, uploaded_at, expiration_date) VALUES
  ('cert1111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://drive.google.com/file/d/1example-certificate/view', '33333333-3333-3333-3333-333333333333', now(), '2025-01-15'),
  ('cert2222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://drive.google.com/file/d/1example-certificate-2/view', '33333333-3333-3333-3333-333333333333', now(), '2025-01-20')
ON CONFLICT (id) DO NOTHING;