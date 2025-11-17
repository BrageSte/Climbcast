/*
  # Add Wall Geometry and Aspect Calculation Metadata

  ## Changes Made

  1. **New Columns in `crags` Table**
     - `wall_geometry` (jsonb, nullable) - Stores array of lat/lon coordinates representing the wall's base line or perimeter from OSM way/relation geometry
     - `aspect_calculation_method` (text, nullable) - Tracks how aspect was calculated for transparency and debugging
       - Possible values: 'osm_tag', 'geometry', 'cliff_detection', 'terrain', null

  2. **Purpose**
     - Enable geometry-based aspect calculation that represents true wall orientation (direction wall faces)
     - Replace terrain-based slope calculation which gives perpendicular direction to wall face
     - Support multiple calculation methods with proper fallback hierarchy
     - Provide transparency in how each crag's aspect was determined

  3. **Data Migration Strategy**
     - All existing crags will have their aspects recalculated using the improved algorithm
     - No data loss - new columns are nullable and additive only

  ## Important Notes

  The `wall_geometry` field stores an array of coordinate points like:
  ```json
  [
    {"lat": 59.9139, "lon": 10.7522},
    {"lat": 59.9140, "lon": 10.7525},
    {"lat": 59.9141, "lon": 10.7528}
  ]
  ```

  This allows calculation of wall orientation by:
  1. Computing bearing along the wall base (from point A to B)
  2. Taking perpendicular direction to get the face orientation
*/

-- Add wall_geometry column to store OSM way/relation coordinates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crags' AND column_name = 'wall_geometry'
  ) THEN
    ALTER TABLE crags ADD COLUMN wall_geometry jsonb;
  END IF;
END $$;

-- Add aspect_calculation_method column to track how aspect was determined
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crags' AND column_name = 'aspect_calculation_method'
  ) THEN
    ALTER TABLE crags ADD COLUMN aspect_calculation_method text
      CHECK (aspect_calculation_method IS NULL OR aspect_calculation_method IN ('osm_tag', 'geometry', 'cliff_detection', 'terrain'));
  END IF;
END $$;

-- Add index on aspect_calculation_method for analytics and debugging
CREATE INDEX IF NOT EXISTS idx_crags_aspect_method ON crags(aspect_calculation_method);

-- Add comment to document the geometry structure
COMMENT ON COLUMN crags.wall_geometry IS 'Array of lat/lon coordinates from OSM way geometry, stored as JSON: [{"lat": 59.9139, "lon": 10.7522}, ...]';
COMMENT ON COLUMN crags.aspect_calculation_method IS 'Method used to calculate aspect: osm_tag (from climbing:orientation), geometry (calculated from wall shape), cliff_detection (DEM cliff analysis), terrain (DEM slope), or null (manual/unknown)';
