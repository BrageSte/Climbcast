/*
  # Update Aspect Calculation Approach
  
  ## Changes
  
  This migration refines the automatic aspect calculation system to use a more
  practical approach:
  
  1. **Remove trigger-based approach** - The pg_net approach doesn't easily handle
     updating the database with the response
  
  2. **Add helper function** - Create a function that can be called from the edge
     function to update aspect after calculation
  
  3. **Strategy** - The client will call the aspect-calculator edge function after
     crag creation/update, which will then call back to update the database
  
  ## New Approach
  
  - Client creates/updates crag normally
  - Client-side hook calls aspect calculator edge function asynchronously
  - Edge function calculates aspect and updates database directly
  - If edge function fails, aspect remains null (manual entry allowed)
*/

-- Drop the old trigger and function since we're changing approach
DROP TRIGGER IF EXISTS trigger_calculate_aspect ON crags;
DROP FUNCTION IF EXISTS calculate_aspect_for_crag();

-- Create a helper function that can be used to update aspect
-- This can be called by the edge function or by clients
CREATE OR REPLACE FUNCTION update_crag_aspect(
  crag_id_param uuid,
  aspect_value integer
)
RETURNS boolean AS $$
BEGIN
  -- Validate aspect value
  IF aspect_value IS NOT NULL AND (aspect_value < 0 OR aspect_value >= 360) THEN
    RAISE EXCEPTION 'Aspect must be between 0 and 359 degrees';
  END IF;
  
  -- Update the crag's aspect
  UPDATE crags
  SET aspect = aspect_value
  WHERE id = crag_id_param;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role (edge functions use this)
-- Note: This is already handled by Supabase's default permissions

COMMENT ON FUNCTION update_crag_aspect(uuid, integer) IS
  'Updates the aspect of a crag. Can be called by edge functions after calculating terrain aspect.';
