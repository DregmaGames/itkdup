/*
  # Datos Demo Completos para ModularApp

  1. Usuarios Demo Creados
    - 2 Certificadores con sus empresas
    - 4 Consultores (2 por certificador)
    - 8 Clientes (2 por consultor)
    - 20 Productos distribuidos entre los clientes

  2. Relaciones Jerárquicas
    - Certificador A -> Consultor A1, A2 -> Clientes A1-1, A1-2, A2-1, A2-2
    - Certificador B -> Consultor B1, B2 -> Clientes B1-1, B1-2, B2-1, B2-2

  3. Productos Diversos
    - Productos con diferentes estados de documentos
    - URLs de QR, DJC y Certificados variados
    - Fechas distribuidas en los últimos 6 meses

  4. Políticas RLS Simplificadas para Demo
    - Admin temporal puede ver todo sin restricciones
*/

-- Limpiar datos demo anteriores si existen
DELETE FROM productos WHERE cliente_id IN (
  SELECT user_id FROM clientes WHERE user_profile.email LIKE '%demo%'
);
DELETE FROM djc_documents WHERE uploaded_by IN (
  SELECT id FROM user_profiles WHERE email LIKE '%demo%'
);
DELETE FROM certificates WHERE uploaded_by IN (
  SELECT id FROM user_profiles WHERE email LIKE '%demo%'
);
DELETE FROM clientes WHERE user_profile.email LIKE '%demo%';
DELETE FROM consultores WHERE user_profile.email LIKE '%demo%';
DELETE FROM certificadores WHERE user_profile.email LIKE '%demo%';
DELETE FROM user_profiles WHERE email LIKE '%demo%';

-- ============================================================================
-- CERTIFICADORES DEMO
-- ============================================================================

-- Certificador A: TechCert Argentina
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('11111111-1111-4111-8111-111111111111', 'cert.techcert@demo.com', 'Cert', 'Carlos Rodríguez', now(), now());

INSERT INTO certificadores (id, user_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES 
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'TechCert Argentina SA', 'Equipos Eléctricos Industriales', '+54 11 4567-8901', 'Av. Corrientes 1234, CABA', true, now(), now());

-- Certificador B: ElectroSafe Certificaciones
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('22222222-2222-4222-8222-222222222222', 'cert.electrosafe@demo.com', 'Cert', 'Ana Martínez', now(), now());

INSERT INTO certificadores (id, user_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES 
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'ElectroSafe Certificaciones SRL', 'Sistemas de Seguridad Eléctrica', '+54 11 5678-9012', 'Av. Santa Fe 5678, CABA', true, now(), now());

-- ============================================================================
-- CONSULTORES DEMO
-- ============================================================================

-- Consultor A1: Bajo TechCert
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('33333333-3333-4333-8333-333333333333', 'consultor.industrial@demo.com', 'Consultor', 'Miguel Fernández', now(), now());

INSERT INTO consultores (id, user_id, certificador_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES 
('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Consultoría Industrial del Sur', 'Motores y Equipos Industriales', '+54 11 6789-0123', 'Av. Rivadavia 2345, CABA', true, now(), now());

-- Consultor A2: Bajo TechCert
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('44444444-4444-4444-8444-444444444444', 'consultor.comercial@demo.com', 'Consultor', 'Laura Gómez', now(), now());

INSERT INTO consultores (id, user_id, certificador_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES 
('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '44444444-4444-4444-8444-444444444444', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Consultoría Comercial Plus', 'Equipos Comerciales y Residenciales', '+54 11 7890-1234', 'Av. Cabildo 3456, CABA', true, now(), now());

-- Consultor B1: Bajo ElectroSafe
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('55555555-5555-4555-8555-555555555555', 'consultor.seguridad@demo.com', 'Consultor', 'Roberto Silva', now(), now());

INSERT INTO consultores (id, user_id, certificador_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES 
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '55555555-5555-4555-8555-555555555555', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Seguridad Eléctrica Integral', 'Protecciones y Tableros', '+54 11 8901-2345', 'Av. Belgrano 4567, CABA', true, now(), now());

-- Consultor B2: Bajo ElectroSafe
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('66666666-6666-4666-8666-666666666666', 'consultor.mantenimiento@demo.com', 'Consultor', 'Patricia López', now(), now());

INSERT INTO consultores (id, user_id, certificador_id, empresa, especialidad, telefono, direccion, activo, created_at, updated_at) VALUES 
('ffffffff-ffff-4fff-8fff-ffffffffffff', '66666666-6666-4666-8666-666666666666', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Mantenimiento y Auditorías SA', 'Mantenimiento Preventivo', '+54 11 9012-3456', 'Av. Callao 5678, CABA', true, now(), now());

-- ============================================================================
-- CLIENTES DEMO
-- ============================================================================

-- Clientes del Consultor A1 (Industrial)
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('77777777-7777-4777-8777-777777777777', 'cliente.metalurgica@demo.com', 'Cliente', 'Juan Carlos Mendoza', now(), now()),
('88888888-8888-4888-8888-888888888888', 'cliente.textil@demo.com', 'Cliente', 'María Elena Vargas', now(), now());

INSERT INTO clientes (id, user_id, consultor_id, cuit, razon_social, nombre_comercial, empresa, sector, telefono, direccion, activo, created_at, updated_at) VALUES 
('gggggggg-gggg-4ggg-8ggg-gggggggggggg', '77777777-7777-4777-8777-777777777777', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '20-12345678-9', 'Metalúrgica San Martín SA', 'MetalSan', 'Metalúrgica San Martín SA', 'Manufactura', '+54 11 4567-8901', 'Parque Industrial San Martín, Lote 45', true, now(), now()),
('hhhhhhhh-hhhh-4hhh-8hhh-hhhhhhhhhhhh', '88888888-8888-4888-8888-888888888888', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '30-87654321-2', 'Textiles del Norte SRL', 'TexNorte', 'Textiles del Norte SRL', 'Manufactura', '+54 11 5678-9012', 'Zona Industrial Norte, Nave 12', true, now(), now());

-- Clientes del Consultor A2 (Comercial)
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('99999999-9999-4999-8999-999999999999', 'cliente.supermercado@demo.com', 'Cliente', 'Carlos Alberto Ruiz', now(), now()),
('aaaaaaab-aaaa-4aaa-8aaa-aaaaaaaaaaab', 'cliente.shopping@demo.com', 'Cliente', 'Lucía Fernández Castro', now(), now());

INSERT INTO clientes (id, user_id, consultor_id, cuit, razon_social, nombre_comercial, empresa, sector, telefono, direccion, activo, created_at, updated_at) VALUES 
('iiiiiiii-iiii-4iii-8iii-iiiiiiiiiiii', '99999999-9999-4999-8999-999999999999', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', '33-11223344-5', 'Supermercados del Centro SA', 'SuperCentro', 'Supermercados del Centro SA', 'Comercio', '+54 11 6789-0123', 'Av. San Juan 1234, CABA', true, now(), now()),
('jjjjjjjj-jjjj-4jjj-8jjj-jjjjjjjjjjjj', 'aaaaaaab-aaaa-4aaa-8aaa-aaaaaaaaaaab', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', '33-55667788-9', 'Shopping Plaza Norte SA', 'Plaza Norte', 'Shopping Plaza Norte SA', 'Comercio', '+54 11 7890-1234', 'Av. Monroe 5678, CABA', true, now(), now());

-- Clientes del Consultor B1 (Seguridad)
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'cliente.hospital@demo.com', 'Cliente', 'Dr. Eduardo Morales', now(), now()),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'cliente.universidad@demo.com', 'Cliente', 'Ing. Sandra Jiménez', now(), now());

INSERT INTO clientes (id, user_id, consultor_id, cuit, razon_social, nombre_comercial, empresa, sector, telefono, direccion, activo, created_at, updated_at) VALUES 
('kkkkkkkk-kkkk-4kkk-8kkk-kkkkkkkkkkkk', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '30-99887766-4', 'Hospital San Carlos SA', 'Hospital San Carlos', 'Hospital San Carlos SA', 'Salud', '+54 11 8901-2345', 'Av. Las Heras 2345, CABA', true, now(), now()),
('llllllll-llll-4lll-8lll-llllllllllll', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '30-44556677-8', 'Universidad Tecnológica del Sur', 'UTS', 'Universidad Tecnológica del Sur', 'Educación', '+54 11 9012-3456', 'Av. Independencia 3456, CABA', true, now(), now());

-- Clientes del Consultor B2 (Mantenimiento)
INSERT INTO user_profiles (id, email, role, name, created_at, updated_at) VALUES 
('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'cliente.fabrica@demo.com', 'Cliente', 'Arq. Fernando Castillo', now(), now()),
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'cliente.oficinas@demo.com', 'Cliente', 'Lic. Gabriela Torres', now(), now());

INSERT INTO clientes (id, user_id, consultor_id, cuit, razon_social, nombre_comercial, empresa, sector, telefono, direccion, activo, created_at, updated_at) VALUES 
('mmmmmmmm-mmmm-4mmm-8mmm-mmmmmmmmmmmm', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'ffffffff-ffff-4fff-8fff-ffffffffffff', '20-33445566-7', 'Fábrica de Autopartes del Plata', 'AutoPlata', 'Fábrica de Autopartes del Plata', 'Manufactura', '+54 11 0123-4567', 'Parque Industrial del Plata, Sector C', true, now(), now()),
('nnnnnnnn-nnnn-4nnn-8nnn-nnnnnnnnnnnn', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'ffffffff-ffff-4fff-8fff-ffffffffffff', '27-77889900-1', 'Torre Corporativa del Este SA', 'Torre Este', 'Torre Corporativa del Este SA', 'Servicios', '+54 11 1234-5678', 'Puerto Madero, Torre A Piso 25', true, now(), now());

-- ============================================================================
-- PRODUCTOS DEMO
-- ============================================================================

-- Productos para Metalúrgica San Martín (Cliente A1-1)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000001-0001-4001-8001-000000000001', 'Motor Trifásico 15HP 1500RPM', 'Siemens Argentina', '2024-12-01', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000001-0001-4001-8001-000000000001', 'https://drive.google.com/file/d/demo_djc_motor15hp/view', 'https://drive.google.com/file/d/demo_cert_motor15hp/view', '77777777-7777-4777-8777-777777777777', '33333333-3333-4333-8333-333333333333', now() - interval '15 days', now(), 'pub-0001-motor-15hp'),
('p0000002-0002-4002-8002-000000000002', 'Reductor de Velocidad 1:30', 'SEW Eurodrive', '2024-11-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000002-0002-4002-8002-000000000002', null, 'https://drive.google.com/file/d/demo_cert_reductor/view', '77777777-7777-4777-8777-777777777777', '33333333-3333-4333-8333-333333333333', now() - interval '30 days', now(), 'pub-0002-reductor-30'),
('p0000003-0003-4003-8003-000000000003', 'Variador de Frecuencia 22kW', 'ABB Argentina', '2024-10-20', null, 'https://drive.google.com/file/d/demo_djc_variador/view', null, '77777777-7777-4777-8777-777777777777', '33333333-3333-4333-8333-333333333333', now() - interval '45 days', now(), 'pub-0003-variador-22kw');

-- Productos para Textiles del Norte (Cliente A1-2)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000004-0004-4004-8004-000000000004', 'Compresor de Aire 100HP', 'Atlas Copco', '2024-11-30', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000004-0004-4004-8004-000000000004', 'https://drive.google.com/file/d/demo_djc_compresor/view', 'https://drive.google.com/file/d/demo_cert_compresor/view', '88888888-8888-4888-8888-888888888888', '33333333-3333-4333-8333-333333333333', now() - interval '20 days', now(), 'pub-0004-compresor-100hp'),
('p0000005-0005-4005-8005-000000000005', 'Bomba Centrífuga 50HP', 'Grundfos', '2024-10-10', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000005-0005-4005-8005-000000000005', null, null, '88888888-8888-4888-8888-888888888888', '33333333-3333-4333-8333-333333333333', now() - interval '60 days', now(), 'pub-0005-bomba-50hp');

-- Productos para Supermercados del Centro (Cliente A2-1)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000006-0006-4006-8006-000000000006', 'Sistema de Refrigeración Comercial', 'Danfoss', '2024-12-15', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000006-0006-4006-8006-000000000006', 'https://drive.google.com/file/d/demo_djc_refrigeracion/view', 'https://drive.google.com/file/d/demo_cert_refrigeracion/view', '99999999-9999-4999-8999-999999999999', '44444444-4444-4444-8444-444444444444', now() - interval '5 days', now(), 'pub-0006-refrigeracion'),
('p0000007-0007-4007-8007-000000000007', 'UPS Trifásico 20kVA', 'APC by Schneider', '2024-11-05', null, 'https://drive.google.com/file/d/demo_djc_ups/view', null, '99999999-9999-4999-8999-999999999999', '44444444-4444-4444-8444-444444444444', now() - interval '35 days', now(), 'pub-0007-ups-20kva'),
('p0000008-0008-4008-8008-000000000008', 'Tablero General 630A', 'Schneider Electric', '2024-09-25', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000008-0008-4008-8008-000000000008', null, 'https://drive.google.com/file/d/demo_cert_tablero630/view', '99999999-9999-4999-8999-999999999999', '44444444-4444-4444-8444-444444444444', now() - interval '75 days', now(), 'pub-0008-tablero-630a');

-- Productos para Shopping Plaza Norte (Cliente A2-2)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000009-0009-4009-8009-000000000009', 'Central de Incendio Direccionable', 'Honeywell', '2024-12-10', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000009-0009-4009-8009-000000000009', 'https://drive.google.com/file/d/demo_djc_incendio/view', 'https://drive.google.com/file/d/demo_cert_incendio/view', 'aaaaaaab-aaaa-4aaa-8aaa-aaaaaaaaaaab', '44444444-4444-4444-8444-444444444444', now() - interval '10 days', now(), 'pub-0009-central-incendio'),
('p0000010-0010-4010-8010-000000000010', 'Escaleras Mecánicas', 'OTIS', '2024-08-15', null, null, 'https://drive.google.com/file/d/demo_cert_escaleras/view', 'aaaaaaab-aaaa-4aaa-8aaa-aaaaaaaaaaab', '44444444-4444-4444-8444-444444444444', now() - interval '90 days', now(), 'pub-0010-escaleras-otis');

-- Productos para Hospital San Carlos (Cliente B1-1)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000011-0011-4011-8011-000000000011', 'Grupo Electrógeno 200kVA', 'Caterpillar', '2024-11-20', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000011-0011-4011-8011-000000000011', 'https://drive.google.com/file/d/demo_djc_grupo/view', 'https://drive.google.com/file/d/demo_cert_grupo/view', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '55555555-5555-4555-8555-555555555555', now() - interval '25 days', now(), 'pub-0011-grupo-200kva'),
('p0000012-0012-4012-8012-000000000012', 'Sistema UPS Hospitalario', 'Eaton', '2024-10-05', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000012-0012-4012-8012-000000000012', null, 'https://drive.google.com/file/d/demo_cert_ups_hosp/view', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '55555555-5555-4555-8555-555555555555', now() - interval '55 days', now(), 'pub-0012-ups-hospitalario'),
('p0000013-0013-4013-8013-000000000013', 'Tablero de Emergencia', 'General Electric', '2024-09-10', null, 'https://drive.google.com/file/d/demo_djc_emergencia/view', null, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '55555555-5555-4555-8555-555555555555', now() - interval '80 days', now(), 'pub-0013-tablero-emergencia');

-- Productos para Universidad Tecnológica (Cliente B1-2)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000014-0014-4014-8014-000000000014', 'Transformador 1000kVA', 'Schneider Electric', '2024-11-01', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000014-0014-4014-8014-000000000014', 'https://drive.google.com/file/d/demo_djc_transformador/view', 'https://drive.google.com/file/d/demo_cert_transformador/view', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '55555555-5555-4555-8555-555555555555', now() - interval '40 days', now(), 'pub-0014-transformador-1000kva'),
('p0000015-0015-4015-8015-000000000015', 'Banco de Capacitores Automático', 'ABB', '2024-08-20', null, null, 'https://drive.google.com/file/d/demo_cert_capacitores/view', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '55555555-5555-4555-8555-555555555555', now() - interval '100 days', now(), 'pub-0015-capacitores');

-- Productos para Fábrica de Autopartes (Cliente B2-1)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000016-0016-4016-8016-000000000016', 'Prensa Hidráulica 300T', 'Schuler', '2024-12-05', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000016-0016-4016-8016-000000000016', 'https://drive.google.com/file/d/demo_djc_prensa/view', 'https://drive.google.com/file/d/demo_cert_prensa/view', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', '66666666-6666-4666-8666-666666666666', now() - interval '12 days', now(), 'pub-0016-prensa-300t'),
('p0000017-0017-4017-8017-000000000017', 'Soldadora Robotizada', 'KUKA', '2024-10-30', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000017-0017-4017-8017-000000000017', null, 'https://drive.google.com/file/d/demo_cert_soldadora/view', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', '66666666-6666-4666-8666-666666666666', now() - interval '50 days', now(), 'pub-0017-soldadora-robot'),
('p0000018-0018-4018-8018-000000000018', 'Horno Industrial 800°C', 'Tenova', '2024-09-05', null, 'https://drive.google.com/file/d/demo_djc_horno/view', null, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', '66666666-6666-4666-8666-666666666666', now() - interval '85 days', now(), 'pub-0018-horno-industrial');

-- Productos para Torre Corporativa (Cliente B2-2)
INSERT INTO productos (id, nombre, fabricante, fecha, qr_code_url, djc_url, certificado_url, cliente_id, consultor_id, created_at, updated_at, public_id) VALUES 
('p0000019-0019-4019-8019-000000000019', 'Sistema HVAC Central', 'Carrier', '2024-11-25', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=p0000019-0019-4019-8019-000000000019', 'https://drive.google.com/file/d/demo_djc_hvac/view', 'https://drive.google.com/file/d/demo_cert_hvac/view', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '66666666-6666-4666-8666-666666666666', now() - interval '18 days', now(), 'pub-0019-hvac-central'),
('p0000020-0020-4020-8020-000000000020', 'Ascensores de Alta Velocidad', 'ThyssenKrupp', '2024-07-15', null, null, 'https://drive.google.com/file/d/demo_cert_ascensores/view', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '66666666-6666-4666-8666-666666666666', now() - interval '120 days', now(), 'pub-0020-ascensores-alta-vel');

-- ============================================================================
-- DOCUMENTOS DEMO EN TABLAS ESPECÍFICAS
-- ============================================================================

-- DJC Documents
INSERT INTO djc_documents (id, producto_id, file_url, uploaded_by, uploaded_at) VALUES 
('djc-0001', 'p0000001-0001-4001-8001-000000000001', 'https://drive.google.com/file/d/demo_djc_motor15hp/view', '77777777-7777-4777-8777-777777777777', now() - interval '14 days'),
('djc-0003', 'p0000003-0003-4003-8003-000000000003', 'https://drive.google.com/file/d/demo_djc_variador/view', '77777777-7777-4777-8777-777777777777', now() - interval '44 days'),
('djc-0004', 'p0000004-0004-4004-8004-000000000004', 'https://drive.google.com/file/d/demo_djc_compresor/view', '88888888-8888-4888-8888-888888888888', now() - interval '19 days'),
('djc-0006', 'p0000006-0006-4006-8006-000000000006', 'https://drive.google.com/file/d/demo_djc_refrigeracion/view', '99999999-9999-4999-8999-999999999999', now() - interval '4 days'),
('djc-0007', 'p0000007-0007-4007-8007-000000000007', 'https://drive.google.com/file/d/demo_djc_ups/view', '99999999-9999-4999-8999-999999999999', now() - interval '34 days');

-- Certificates
INSERT INTO certificates (id, producto_id, file_url, uploaded_by, uploaded_at, expiration_date) VALUES 
('cert-0001', 'p0000001-0001-4001-8001-000000000001', 'https://drive.google.com/file/d/demo_cert_motor15hp/view', '77777777-7777-4777-8777-777777777777', now() - interval '14 days', '2025-12-01'),
('cert-0002', 'p0000002-0002-4002-8002-000000000002', 'https://drive.google.com/file/d/demo_cert_reductor/view', '77777777-7777-4777-8777-777777777777', now() - interval '29 days', '2025-11-15'),
('cert-0004', 'p0000004-0004-4004-8004-000000000004', 'https://drive.google.com/file/d/demo_cert_compresor/view', '88888888-8888-4888-8888-888888888888', now() - interval '19 days', '2025-11-30'),
('cert-0006', 'p0000006-0006-4006-8006-000000000006', 'https://drive.google.com/file/d/demo_cert_refrigeracion/view', '99999999-9999-4999-8999-999999999999', now() - interval '4 days', '2025-12-15'),
('cert-0008', 'p0000008-0008-4008-8008-000000000008', 'https://drive.google.com/file/d/demo_cert_tablero630/view', '99999999-9999-4999-8999-999999999999', now() - interval '74 days', '2025-09-25'),
('cert-0009', 'p0000009-0009-4009-8009-000000000009', 'https://drive.google.com/file/d/demo_cert_incendio/view', 'aaaaaaab-aaaa-4aaa-8aaa-aaaaaaaaaaab', now() - interval '9 days', '2025-12-10'),
('cert-0010', 'p0000010-0010-4010-8010-000000000010', 'https://drive.google.com/file/d/demo_cert_escaleras/view', 'aaaaaaab-aaaa-4aaa-8aaa-aaaaaaaaaaab', now() - interval '89 days', '2025-08-15');

-- ============================================================================
-- POLÍTICAS RLS SIMPLIFICADAS PARA DEMO (Admin puede ver todo)
-- ============================================================================

-- Política temporal para que el admin demo pueda ver todo sin restricciones
CREATE POLICY "admin_demo_full_access" ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  );

-- Política similar para productos
CREATE POLICY "admin_demo_productos_access" ON productos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  );

-- Política similar para clientes
CREATE POLICY "admin_demo_clientes_access" ON clientes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  );

-- Política similar para consultores
CREATE POLICY "admin_demo_consultores_access" ON consultores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  );

-- Política similar para certificadores
CREATE POLICY "admin_demo_certificadores_access" ON certificadores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
    )
  );