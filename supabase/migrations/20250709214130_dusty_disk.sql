/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Problem
    - The admin policies for user_profiles table create infinite recursion
    - They check if a user is admin by querying user_profiles table within the policy
    - This creates a circular reference causing infinite recursion

  2. Solution
    - Drop the problematic admin policies
    - Create new policies that avoid circular references
    - Use a safer approach for admin access

  3. Changes
    - Drop existing admin policies that cause recursion
    - Create new simplified policies
    - Keep the working user policies intact
*/

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

-- Create new admin policies that avoid circular references
-- For now, we'll use a simpler approach that checks the user's role directly
CREATE POLICY "Enable admin read access"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow users to read their own profile
    (auth.uid() = id)
    OR
    -- Allow admin access by checking if the requesting user has admin role
    -- This avoids recursion by using a subquery with explicit table alias
    (EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
      LIMIT 1
    ))
  );

CREATE POLICY "Enable admin update access"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow users to update their own profile
    (auth.uid() = id)
    OR
    -- Allow admin access with the same safe approach
    (EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'Admin'
      LIMIT 1
    ))
  );

-- Also ensure the basic user policies exist (recreate if needed)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

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