/*
  # Add firma_png_url column to user_profiles table

  1. New Column
    - `firma_png_url` (text, nullable) - URL to user's digital signature PNG image

  2. Purpose
    - Store digital signature images for DJC document generation
    - Allow users to upload and manage their signature files
*/

-- Add firma_png_url column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN firma_png_url text;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.firma_png_url IS 'URL to user digital signature PNG image for DJC documents';