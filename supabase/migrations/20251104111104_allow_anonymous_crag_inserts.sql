/*
  # Allow Anonymous Crag Inserts for OSM Imports

  ## Changes
  
  1. Add policy to allow anyone to insert crags
     - Needed for OSM import scripts that run with anon key
     - In production, you may want to restrict this to service role only
  
  ## Security Note
  
  This allows public inserts to the crags table. For production use:
  - Consider removing this policy and using service role key for imports
  - Or add validation checks in the policy
  - Or use edge functions with service role access
*/

-- Allow anyone to insert crags (for OSM imports)
CREATE POLICY "Anyone can insert crags"
  ON crags
  FOR INSERT
  WITH CHECK (true);
