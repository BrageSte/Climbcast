/*
  # Automatic Aspect Calculation Trigger System

  ## Overview
  This migration sets up automatic terrain aspect calculation for climbing crags
  using database triggers and the aspect-calculator edge function.

  ## Changes
  
  1. **Extensions**
     - Enable pg_net extension for async HTTP requests to edge functions
  
  2. **Functions**
     - `calculate_aspect_for_crag()` - Trigger function that automatically calculates aspect
       when a crag is inserted or when its coordinates are updated
  
  3. **Triggers**
     - `trigger_calculate_aspect` - Fires AFTER INSERT OR UPDATE on crags table
       Only executes when:
       - New row has null aspect, OR
       - Latitude or longitude values have changed
  
  ## Behavior
  
  - Aspect calculation happens asynchronously in the background
  - If calculation fails, crag is still saved with null aspect (manual entry allowed)
  - Calculation automatically triggers when coordinates are updated
  - Edge function is called with proper authentication headers
  
  ## Security
  
  - Uses service role authentication for edge function calls
  - Respects existing RLS policies on crags table
  - No additional permissions required for users
*/

-- Enable pg_net extension for async HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to calculate aspect for a crag using the edge function
CREATE OR REPLACE FUNCTION calculate_aspect_for_crag()
RETURNS TRIGGER AS $$
DECLARE
  aspect_calculator_url text;
  request_url text;
  service_role_key text;
  supabase_url text;
BEGIN
  -- Only proceed if aspect is null OR if coordinates have changed
  IF (TG_OP = 'INSERT' AND NEW.aspect IS NULL) OR 
     (TG_OP = 'UPDATE' AND (OLD.latitude != NEW.latitude OR OLD.longitude != NEW.longitude)) THEN
    
    -- Get Supabase URL from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    
    -- Fallback to constructing URL if not set
    IF supabase_url IS NULL OR supabase_url = '' THEN
      supabase_url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co';
    END IF;
    
    -- Construct the edge function URL
    aspect_calculator_url := supabase_url || '/functions/v1/aspect-calculator';
    request_url := aspect_calculator_url || '?lat=' || NEW.latitude::text || '&lon=' || NEW.longitude::text || '&provider=opentopodata';
    
    -- Get service role key (this would be set in Supabase environment)
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Make async HTTP request using pg_net
    -- Note: We don't wait for the response, letting it happen in the background
    -- If the request succeeds, we'll update the aspect via a callback
    PERFORM net.http_post(
      url := request_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 15000
    );
    
    -- Note: We don't block the transaction waiting for the response
    -- The aspect will remain null if calculation fails, allowing manual entry
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after insert or update
DROP TRIGGER IF EXISTS trigger_calculate_aspect ON crags;

CREATE TRIGGER trigger_calculate_aspect
  AFTER INSERT OR UPDATE OF latitude, longitude, aspect
  ON crags
  FOR EACH ROW
  EXECUTE FUNCTION calculate_aspect_for_crag();

-- Add comment explaining the trigger
COMMENT ON TRIGGER trigger_calculate_aspect ON crags IS 
  'Automatically calculates terrain aspect when a crag is created or coordinates are updated';

COMMENT ON FUNCTION calculate_aspect_for_crag() IS
  'Trigger function that calls aspect-calculator edge function asynchronously to calculate terrain aspect from DEM data';
