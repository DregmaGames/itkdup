/*
  # Crear usuario administrador

  1. Configuración de Usuario Admin
    - Asignar rol 'Admin' al email javi.rioos@gmail.com
    - Crear o actualizar perfil de usuario
    - Establecer configuración inicial
  
  2. Notas importantes
    - El usuario debe registrarse primero en la aplicación
    - Esta migración solo asigna el rol de Admin
    - Si el usuario no existe, se proporcionan instrucciones
*/

-- Función para crear/actualizar usuario admin
DO $$
DECLARE
  target_email text := 'javi.rioos@gmail.com';
  target_user_id uuid;
  existing_profile_id uuid;
BEGIN
  -- Buscar si ya existe un usuario con este email en auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;

  -- Si el usuario existe en auth.users
  IF target_user_id IS NOT NULL THEN
    
    -- Verificar si ya existe el perfil
    SELECT id INTO existing_profile_id 
    FROM user_profiles 
    WHERE id = target_user_id;
    
    -- Si ya existe el perfil, actualizar el rol
    IF existing_profile_id IS NOT NULL THEN
      UPDATE user_profiles 
      SET 
        role = 'Admin',
        name = COALESCE(name, 'Administrador'),
        updated_at = now()
      WHERE id = target_user_id;
      
      RAISE NOTICE 'Usuario actualizado: % ahora tiene rol Admin', target_email;
      
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
    
  ELSE
    -- Si el usuario no existe en auth.users
    RAISE NOTICE 'ATENCIÓN: El usuario % no existe en auth.users', target_email;
    RAISE NOTICE 'Para crear la cuenta admin:';
    RAISE NOTICE '1. El usuario debe registrarse primero en la aplicación';
    RAISE NOTICE '2. Usar email: %', target_email;
    RAISE NOTICE '3. Después de registrarse, ejecutar esta migración nuevamente';
  END IF;

END $$;

-- Verificar el resultado
DO $$
DECLARE
  admin_count integer;
  target_email text := 'javi.rioos@gmail.com';
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM user_profiles 
  WHERE email = target_email AND role = 'Admin';
  
  IF admin_count > 0 THEN
    RAISE NOTICE 'ÉXITO: Usuario % configurado como Admin', target_email;
  ELSE
    RAISE NOTICE 'PENDIENTE: Usuario % necesita registrarse primero', target_email;
  END IF;
END $$;