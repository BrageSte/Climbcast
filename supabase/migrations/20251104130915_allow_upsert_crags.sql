/*
  # Allow Upsert Operations for Crags
  
  ## Changes
  
  1. Add UPDATE policy to allow upserts during OSM imports
     - Upsert requires both INSERT and UPDATE policies
     - Needed for re-running imports without duplicates
  
  ## Security Note
  
  This allows public updates to the crags table for upsert operations.
*/

-- Drop existing policies if they exist to recreate them
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crags' AND policyname = 'Anyone can insert crags') THEN
    DROP POLICY "Anyone can insert crags" ON crags;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crags' AND policyname = 'Anyone can update crags') THEN
    DROP POLICY "Anyone can update crags" ON crags;
  END IF;
END $$;

-- Allow inserts for OSM imports
CREATE POLICY "Anyone can insert crags"
  ON crags
  FOR INSERT
  WITH CHECK (true);

-- Allow updates for upsert operations during OSM imports
CREATE POLICY "Anyone can update crags"
  ON crags
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
