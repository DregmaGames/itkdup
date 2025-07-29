/*
  # Fix RLS circular reference for user_profiles

  1. Remove all existing policies that cause infinite recursion
  2. Create a safe function to check admin status using SECURITY DEFINER
  3. Create new policies that use the safe function
  4. Update admin user metadata as fallback

  This fixes the infinite recursion error by avoiding querying user_profiles
  within its own RLS policies.
*/

-- First, let's drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable admin read access" ON user_profiles;
DROP POLICY IF EXISTS "Enable admin update access" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles via metadata" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile via metadata" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles safely" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile safely" ON user_profiles;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_admin();

-- Create a function that safely checks admin status
-- This function uses SECURITY DEFINER to bypass RLS when checking admin role
CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the current user's role directly from user_profiles
  -- SECURITY DEFINER allows us to bypass RLS for this query
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- Return true if user has Admin role
  RETURN user_role = 'Admin';
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, return false for safety
    RETURN false;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_user_is_admin() TO authenticated;

-- Create simple, safe policies that don't cause recursion
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create admin policies using the safe function
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) OR check_user_is_admin()
  );

CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = id) OR check_user_is_admin()
  );

-- Update the admin user's metadata as a fallback approach
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'javi.rioos@gmail.com';

-- Verify the admin user exists and has the correct role
DO $$
DECLARE
  admin_exists boolean;
  admin_email text := 'javi.rioos@gmail.com';
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_profiles 
    WHERE email = admin_email AND role = 'Admin'
  ) INTO admin_exists;
  
  IF admin_exists THEN
    RAISE NOTICE 'Admin user % verified with correct role', admin_email;
  ELSE
    RAISE NOTICE 'Warning: Admin user % not found or incorrect role', admin_email;
  END IF;
END $$;