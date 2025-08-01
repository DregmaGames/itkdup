/*
  # Add DJC firmada URL column

  1. New Column
    - `djc_firmada_url` (text) - URL to signed DJC document in Supabase Storage
  
  2. Updates
    - Add column to productos table
    - Allow null values for existing records
*/

ALTER TABLE productos ADD COLUMN djc_firmada_url text;