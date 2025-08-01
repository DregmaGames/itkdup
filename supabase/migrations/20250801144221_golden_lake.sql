/*
  # Fix Admin SELECT Policy for user_profiles
  
  1. Problem
    - Current policy checks for existence in 'admins' table
    - Admin users only have role = 'Admin' in user_profiles table
    
  2. Solution  
    - Update policy to check user_profiles.role = 'Admin'
    - This allows Admin users to view all user profiles
*/

-- Drop the existing admin select policy that checks admins table
DROP POLICY IF EXISTS "user_profiles_admin_select" ON public.user_profiles;

-- Create new admin select policy that checks role in user_profiles
CREATE POLICY "user_profiles_admin_select" 
ON public.user_profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'Admin'
  )
);