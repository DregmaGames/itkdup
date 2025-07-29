/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique) - user email
      - `role` (text) - user role (Admin, Cert, Consultor, Cliente)  
      - `name` (text, nullable) - user display name
      - `avatar` (text, nullable) - user avatar URL
      - `created_at` (timestamp) - creation timestamp
      - `updated_at` (timestamp) - last update timestamp

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read their own profile
    - Add policy for admins to read all profiles
    - Add policy for users to update their own profile
    - Add policy for admins to update any profile

  3. Triggers
    - Auto-create profile when user signs up
    - Auto-update `updated_at` timestamp
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Cert', 'Consultor', 'Cliente')),
  name text,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Function to auto-create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, name)
  VALUES (
    NEW.id,
    NEW.email,
    'Cliente', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to auto-update timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS on_user_profiles_updated ON user_profiles;
CREATE TRIGGER on_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();