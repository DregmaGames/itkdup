/*
  # Add INSERT policy for user_profiles table

  1. Security Changes
    - Add INSERT policy to allow admins to create new user profiles
    - This enables the admin interface to create new users in the system

  2. Policy Details
    - Only authenticated users with 'Admin' role can insert new user profiles
    - Uses the existing check_user_is_admin() function for consistency
*/

-- Add INSERT policy for user_profiles table
CREATE POLICY "Admins can insert new profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (check_user_is_admin());