/*
  # Add Unique Constraint for OSM Imports

  ## Changes
  
  1. Add unique constraint on (name, latitude, longitude) to allow safe upsert operations
     - Prevents duplicate crags with the same name and coordinates
     - Enables conflict resolution during OSM imports
  
  2. Add index on source field for filtering by data origin
     - Improves query performance when filtering by source (manual, osm, etc.)
*/

-- Add unique constraint to prevent duplicate crags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'crags_name_location_unique'
  ) THEN
    ALTER TABLE crags 
    ADD CONSTRAINT crags_name_location_unique 
    UNIQUE (name, latitude, longitude);
  END IF;
END $$;

-- Add index on source field for better filtering performance
CREATE INDEX IF NOT EXISTS idx_crags_source ON crags(source);
