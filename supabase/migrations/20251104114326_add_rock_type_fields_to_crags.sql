/*
  # Add Rock Type Fields to Crags Table

  ## Changes Made
  
  ### Modified Tables
  - `crags` table
    - Added `rock_type` (text, nullable) - Normalized rock type (granitt, gneis, kalkstein, sandstein, skifer, basalt, konglomerat, annet, ukjent)
    - Added `rock_source` (text, nullable) - Data source for rock type (NGU, OSM, Manual, Inferred)
    - Added `rock_confidence` (integer, nullable) - Confidence score 0-100
    - Added `rock_raw` (text, nullable) - Raw value from external source for debugging and review
  
  ### Constraints
  - rock_type must be one of the valid Norwegian rock types or null
  - rock_source must be one of the valid source types or null
  - rock_confidence must be between 0 and 100 if provided
  
  ### Indexes
  - Added index on rock_type for efficient filtering
  - Added index on rock_source for querying by data source
  
  ### Notes
  - All fields are nullable to support gradual data population
  - Manual entries (rock_source='Manual') have highest priority with 100% confidence
  - NGU and OSM direct tags typically have 80-90% confidence
  - Regional inference has lower confidence (20-40%)
*/

-- Add rock type columns to crags table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crags' AND column_name = 'rock_type'
  ) THEN
    ALTER TABLE crags ADD COLUMN rock_type text CHECK (
      rock_type IS NULL OR 
      rock_type IN ('granitt', 'gneis', 'kalkstein', 'sandstein', 'skifer', 'basalt', 'konglomerat', 'annet', 'ukjent')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crags' AND column_name = 'rock_source'
  ) THEN
    ALTER TABLE crags ADD COLUMN rock_source text CHECK (
      rock_source IS NULL OR 
      rock_source IN ('NGU', 'OSM', 'Manual', 'Inferred')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crags' AND column_name = 'rock_confidence'
  ) THEN
    ALTER TABLE crags ADD COLUMN rock_confidence integer CHECK (
      rock_confidence IS NULL OR 
      (rock_confidence >= 0 AND rock_confidence <= 100)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crags' AND column_name = 'rock_raw'
  ) THEN
    ALTER TABLE crags ADD COLUMN rock_raw text;
  END IF;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_crags_rock_type ON crags(rock_type) WHERE rock_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crags_rock_source ON crags(rock_source) WHERE rock_source IS NOT NULL;

-- Add comment explaining the rock type system
COMMENT ON COLUMN crags.rock_type IS 'Normalized rock type: granitt, gneis, kalkstein, sandstein, skifer, basalt, konglomerat, annet, ukjent';
COMMENT ON COLUMN crags.rock_source IS 'Data source priority: Manual (100%) > NGU (80-90%) > OSM (50-90%) > Inferred (20-40%)';
COMMENT ON COLUMN crags.rock_confidence IS 'Confidence score 0-100, where Manual=100, NGU/OSM direct=80-90, OSM inferred=50-70, Regional=20-40';
COMMENT ON COLUMN crags.rock_raw IS 'Raw value from external source for review and debugging';