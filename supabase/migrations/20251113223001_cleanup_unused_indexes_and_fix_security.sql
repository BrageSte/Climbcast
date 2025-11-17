/*
  # Cleanup Unused Indexes and Fix Security Issues
  
  ## Changes
  
  1. **Remove Unused Indexes**
     - Drop indexes that are not being used by the application
     - These indexes consume storage and slow down write operations
     - Indexes being removed:
       - idx_change_requests_crag_id
       - idx_change_requests_status
       - idx_change_requests_created_at
       - idx_crags_location
       - idx_friction_feedback_timestamp
       - idx_crags_rock_type
       - idx_crags_rock_source
       - idx_user_favorites_session_id
       - idx_user_favorites_crag_id
  
  2. **Fix Function Security Issue**
     - Set explicit search_path on update_crag_aspect function
     - Prevents search path manipulation attacks
  
  ## Rationale
  
  - Unused indexes waste storage space and slow down INSERT/UPDATE operations
  - The remaining default indexes (primary keys, unique constraints, foreign keys)
    are sufficient for current query patterns
  - If specific queries become slow in the future, targeted indexes can be added
  
  ## Security
  
  - Setting search_path to empty string with pg_catalog prevents search path attacks
  - SECURITY DEFINER functions must have immutable search_path
*/

-- Drop unused indexes on crag_change_requests
DROP INDEX IF EXISTS idx_change_requests_crag_id;
DROP INDEX IF EXISTS idx_change_requests_status;
DROP INDEX IF EXISTS idx_change_requests_created_at;

-- Drop unused indexes on crags
DROP INDEX IF EXISTS idx_crags_location;
DROP INDEX IF EXISTS idx_crags_rock_type;
DROP INDEX IF EXISTS idx_crags_rock_source;

-- Drop unused indexes on friction_feedback
DROP INDEX IF EXISTS idx_friction_feedback_timestamp;

-- Drop unused indexes on user_favorites
DROP INDEX IF EXISTS idx_user_favorites_session_id;
DROP INDEX IF EXISTS idx_user_favorites_crag_id;

-- Fix search path security issue for update_crag_aspect function
DROP FUNCTION IF EXISTS update_crag_aspect(uuid, integer);

CREATE OR REPLACE FUNCTION update_crag_aspect(
  crag_id_param uuid,
  aspect_value integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validate aspect value
  IF aspect_value IS NOT NULL AND (aspect_value < 0 OR aspect_value >= 360) THEN
    RAISE EXCEPTION 'Aspect must be between 0 and 359 degrees';
  END IF;
  
  -- Update the crag's aspect (use fully qualified table name)
  UPDATE public.crags
  SET aspect = aspect_value
  WHERE id = crag_id_param;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION update_crag_aspect(uuid, integer) IS
  'Updates the aspect of a crag. Can be called by edge functions after calculating terrain aspect. SECURITY DEFINER with immutable search_path.';
