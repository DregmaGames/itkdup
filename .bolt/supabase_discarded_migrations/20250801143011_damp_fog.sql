/*
  # Add INSERT policies for user_profiles table

  1. Security Policies
    - Add INSERT policy for Admins to create any user profile
    - Add INSERT policy for Certificadores to create Consultor and Cliente profiles
    - Add INSERT policy for Consultores to create Cliente profiles

  This fixes the RLS policy violation error when creating new users through the CreateUserModal.
*/

-- Policy for Admins to insert any user profile
CREATE POLICY "user_profiles_admin_insert"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'Admin'
    )
  );

-- Policy for Certificadores to insert Consultor and Cliente profiles
CREATE POLICY "user_profiles_certificador_insert"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles cert_profile
      WHERE cert_profile.id = auth.uid() 
      AND cert_profile.role = 'Cert'
    )
    AND role IN ('Consultor', 'Cliente')
  );

-- Policy for Consultores to insert Cliente profiles
CREATE POLICY "user_profiles_consultor_insert"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles cons_profile
      WHERE cons_profile.id = auth.uid() 
      AND cons_profile.role = 'Consultor'
    )
    AND role = 'Cliente'
  );