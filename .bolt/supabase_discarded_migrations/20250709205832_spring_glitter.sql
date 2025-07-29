/*
  # Crear usuario Admin con contraseña

  1. Función para crear usuario admin
    - Crea usuario en auth.users con contraseña encriptada
    - Configura perfil en user_profiles con rol Admin
    - Establece identidad en auth.identities
    - Maneja casos existentes actualizando datos

  2. Credenciales
    - Email: javi.rioos@gmail.com
    - Contraseña: 999Deda
    - Rol: Admin
    - Nombre: Administrador

  3. Verificación
    - Confirma que el usuario fue creado correctamente
    - Muestra información de acceso
*/

-- Función para crear usuario admin con contraseña
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_email text := 'javi.rioos@gmail.com';
  target_password text := '999Deda';
  target_user_id uuid;
  existing_profile_id uuid;
  encrypted_password text;
BEGIN
  -- Buscar si ya existe un usuario con este email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;

  -- Si el usuario NO existe, crearlo
  IF target_user_id IS NULL THEN
    
    -- Generar ID único para el usuario
    target_user_id := gen_random_uuid();
    
    -- Encriptar la contraseña usando la función de Supabase
    encrypted_password := crypt(target_password, gen_salt('bf'));
    
    -- Insertar en auth.users con solo las columnas esenciales
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmed_at
    ) VALUES (
      target_user_id,
      '00000000-0000-0000-0000-000000000000',
      target_email,
      encrypted_password,
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated',
      '',
      '{"provider":"email","providers":["email"]}',
      '{"name":"Administrador"}',
      false,
      now()
    );
    
    RAISE NOTICE 'Usuario creado en auth.users: %', target_email;
    
  ELSE
    -- Si el usuario ya existe, actualizar la contraseña
    encrypted_password := crypt(target_password, gen_salt('bf'));
    
    UPDATE auth.users 
    SET 
      encrypted_password = encrypted_password,
      updated_at = now(),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmed_at = COALESCE(confirmed_at, now())
    WHERE id = target_user_id;
    
    RAISE NOTICE 'Contraseña actualizada para usuario: %', target_email;
  END IF;

  -- Verificar si ya existe el perfil
  SELECT id INTO existing_profile_id 
  FROM user_profiles 
  WHERE id = target_user_id;
  
  -- Si ya existe el perfil, actualizar
  IF existing_profile_id IS NOT NULL THEN
    UPDATE user_profiles 
    SET 
      role = 'Admin',
      name = 'Administrador',
      updated_at = now()
    WHERE id = target_user_id;
    
    RAISE NOTICE 'Perfil actualizado: % ahora tiene rol Admin', target_email;
    
  ELSE
    -- Si no existe el perfil, crearlo
    INSERT INTO user_profiles (id, email, role, name, created_at, updated_at)
    VALUES (
      target_user_id,
      target_email,
      'Admin',
      'Administrador',
      now(),
      now()
    );
    
    RAISE NOTICE 'Perfil creado: % con rol Admin', target_email;
  END IF;

  -- Crear identidad en auth.identities si no existe
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = target_user_id) THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      target_user_id,
      json_build_object(
        'sub', target_user_id::text,
        'email', target_email,
        'name', 'Administrador',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now()
    );
    
    RAISE NOTICE 'Identidad creada para usuario: %', target_email;
  END IF;

END $$;

-- Ejecutar la función
SELECT create_admin_user();

-- Limpiar la función (opcional, por seguridad)
DROP FUNCTION IF EXISTS create_admin_user();

-- Verificar el resultado
DO $$
DECLARE
  admin_count integer;
  target_email text := 'javi.rioos@gmail.com';
  user_exists boolean;
  profile_exists boolean;
BEGIN
  -- Verificar si existe en auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = target_email) INTO user_exists;
  
  -- Verificar si existe el perfil admin
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE email = target_email AND role = 'Admin') INTO profile_exists;
  
  IF user_exists AND profile_exists THEN
    RAISE NOTICE '✅ ÉXITO: Usuario admin % configurado correctamente', target_email;
    RAISE NOTICE '📧 Email: %', target_email;
    RAISE NOTICE '🔑 Contraseña: 999Deda';
    RAISE NOTICE '👤 Rol: Admin';
    RAISE NOTICE '🚀 Puede iniciar sesión inmediatamente';
  ELSIF user_exists THEN
    RAISE NOTICE '⚠️  Usuario existe pero falta perfil para: %', target_email;
  ELSE
    RAISE NOTICE '❌ ERROR: No se pudo crear el usuario: %', target_email;
  END IF;
END $$;