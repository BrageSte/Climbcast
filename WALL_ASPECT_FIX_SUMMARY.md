# Wall Aspect Calculation Fix - Implementation Summary

## Problem Statement

The previous aspect calculation was measuring **terrain slope direction** (the direction of steepest elevation change) instead of **wall face orientation** (the direction a climbing wall actually faces). This resulted in aspects that were perpendicular to the actual wall face, making weather predictions inaccurate.

### Example Issue
- For a cliff edge running East-West, the old calculation would show the slope direction (pointing away from the cliff)
- The correct aspect should show the wall face direction (North or South, depending on which side climbers use)

---

## Solution Overview

Implemented a **multi-method aspect calculation system** with the following priority:

1. **OSM Tag** (if available) - Direct from `climbing:orientation`
2. **Geometry-Based** - Calculate from OSM way coordinates
3. **Cliff Detection** - Enhanced DEM analysis to identify vertical faces
4. **Terrain Fallback** - Original slope-based calculation (last resort)

---

## Changes Made

### 1. Database Schema Updates

**New Migration:** `20251117000000_add_wall_geometry_and_aspect_metadata.sql`

Added two new columns to the `crags` table:
- `wall_geometry` (jsonb) - Stores OSM way node coordinates as JSON array
- `aspect_calculation_method` (text) - Tracks which method was used

```sql
-- Example geometry storage
{
  "wall_geometry": [
    {"lat": 59.9139, "lon": 10.7522},
    {"lat": 59.9140, "lon": 10.7525},
    {"lat": 59.9141, "lon": 10.7528}
  ],
  "aspect_calculation_method": "geometry"
}
```

### 2. OSM Data Import Enhancement

**Modified:** `src/api/osmOverpass.ts`

- Changed Overpass query from `out center;` to `out center geom;`
- Added `geometry` field to `OSMElement` and `OSMCrag` interfaces
- Captures full way geometry (array of coordinates) for ways and relations
- Stores geometry data in database during import

### 3. Geometry-Based Aspect Calculation

**New File:** `src/utils/geometryAspectCalculator.ts`

Implements the core calculation logic:

```typescript
// Key algorithm:
// 1. Calculate bearing along wall base (point A → point B)
// 2. Compute perpendicular angles (+90° and -90°)
// 3. Determine which perpendicular points toward the wall face
// 4. Average multiple segments weighted by length
// 5. Return confidence score based on variance
```

**How it works:**
- For each segment of the wall geometry, calculate the bearing (direction along the wall)
- Take perpendicular directions to get potential wall face orientations
- Choose the perpendicular that points toward the climbing area (using center point)
- Weight segments by length and compute vector average
- Higher confidence when segments are consistent

### 4. Improved Cliff Detection

**Enhanced:** Elevation grid analysis in edge function

- Increased grid size from 3×3 to 7×7 for better cliff feature detection
- Analyzes elevation drops in all 8 compass directions
- Identifies significant cliffs (>20m drop with >15m variance)
- Returns the direction of the steepest drop as cliff face orientation
- Provides confidence score based on drop magnitude

### 5. Supabase Edge Function Update

**Updated:** `supabase/functions/aspect-calculator/index.ts`

New features:
- Accepts optional `geometry` parameter as JSON
- Implements full geometry-based calculation
- Enhanced cliff detection algorithm
- Returns `method` and `confidence` in response
- Falls back through priority chain if methods fail

### 6. Client-Side API Updates

**Modified:** `src/api/aspectCalculator.ts`

- Added `method` and `confidence` to `AspectResult` interface
- Added `geometry` parameter to `calculateAspect()` function
- Passes geometry data to edge function when available

### 7. Type Definitions

**Updated:** `src/types.ts`

```typescript
interface Crag {
  // ... existing fields
  wall_geometry: Array<{ lat: number; lon: number }> | null;
  aspect_calculation_method: 'osm_tag' | 'geometry' | 'cliff_detection' | 'terrain' | null;
}
```

### 8. Recalculation Script

**New File:** `src/scripts/recalculateAllAspects.ts`

- Recalculates aspects for ALL crags in database
- Uses geometry data when available
- Logs calculation method and confidence for each crag
- Provides detailed statistics on methods used
- Validates results against reference crags (Kolsås and Damtjern)

**New NPM Script:**
```bash
npm run recalculate-aspects
```

---

## How to Use

### For Existing Database

1. **Apply Migration** (already done):
   ```bash
   # Migration applied via Supabase MCP tool
   ```

2. **Deploy Updated Edge Function** (already done):
   ```bash
   # Function deployed via Supabase MCP tool
   ```

3. **Recalculate All Aspects**:
   ```bash
   npm run recalculate-aspects
   ```

   This will:
   - Process all crags in batches
   - Use geometry calculation where available
   - Fall back to improved cliff detection
   - Update database with new aspects and methods
   - Validate against Kolsås (~225°) and Damtjern (~135°)

### For Future OSM Imports

```bash
npm run import-osm
```

This now automatically:
- Captures wall geometry from OSM ways
- Stores geometry in database
- Sets calculation method appropriately

---

## Technical Details

### Geometry Calculation Algorithm

The geometry-based calculation determines wall face orientation by:

1. **Segment Analysis**: For each pair of consecutive points in the wall geometry:
   - Calculate bearing (compass direction from point A to B)
   - This bearing represents the direction along the wall base

2. **Perpendicular Calculation**:
   - Calculate two perpendiculars: bearing + 90° and bearing - 90°
   - These represent the two possible wall face directions

3. **Face Selection**:
   - Determine which perpendicular points toward the climbing area
   - Use the crag's center point to identify the "climbing side"
   - Select perpendicular that has smallest angle to center point direction

4. **Averaging**:
   - Weight each segment by its length
   - Perform circular vector averaging (important for angles!)
   - Handle wraparound (e.g., averaging 350° and 10° = 0°, not 180°)

5. **Confidence Scoring**:
   - Calculate variance of segment aspects
   - Higher variance = lower confidence
   - Confidence = 1 - (variance / 90°)

### Cliff Detection Algorithm

The enhanced cliff detection:

1. **Grid Sampling**: Fetch 7×7 elevation grid (49 points)
2. **Directional Analysis**: Calculate elevation drops in 8 compass directions
3. **Cliff Identification**: Find direction with maximum elevation drop
4. **Validation**: Require >20m drop and >15m variance from minimum drop
5. **Confidence**: Based on drop magnitude (normalized to 50m)

### Method Priority Logic

```
1. OSM Tag (climbing:orientation)
   ↓ (if not available)
2. Geometry Calculation
   ↓ (if no geometry or low confidence < 0.3)
3. Cliff Detection (DEM with >20m drop)
   ↓ (if no cliff detected)
4. Terrain Slope (original method)
```

---

## Validation

### Reference Crags

Two well-known crags used for validation:

1. **Kolsås** - Expected aspect: ~225° (SW-facing)
2. **Damtjern** - Expected aspect: ~135° (SE-facing)

The recalculation script automatically checks these and reports differences.

### Success Criteria

- Aspect within ±30° of expected = ✅ Success
- Aspect >30° difference = ⚠️ Review needed

---

## Files Changed

### New Files
- `supabase/migrations/20251117000000_add_wall_geometry_and_aspect_metadata.sql`
- `src/utils/geometryAspectCalculator.ts`
- `src/scripts/recalculateAllAspects.ts`
- `WALL_ASPECT_FIX_SUMMARY.md` (this file)

### Modified Files
- `src/api/osmOverpass.ts` - Added geometry capture
- `src/api/aspectCalculator.ts` - Added geometry parameter and response fields
- `src/types.ts` - Added geometry and method fields to Crag interface
- `src/scripts/importOSMCrags.ts` - Store geometry during import
- `supabase/functions/aspect-calculator/index.ts` - Complete rewrite with new algorithms
- `package.json` - Added recalculate-aspects script

---

## Next Steps

1. **Run Recalculation**: Execute `npm run recalculate-aspects` to update all existing crags
2. **Verify Results**: Check validation output for Kolsås and Damtjern
3. **Monitor Statistics**: Review which calculation methods are most commonly used
4. **Adjust Thresholds**: If needed, tune confidence thresholds or cliff detection parameters

---

## Monitoring & Debugging

### Check Calculation Methods Distribution

Query the database to see method usage:

```sql
SELECT
  aspect_calculation_method,
  COUNT(*) as count
FROM crags
GROUP BY aspect_calculation_method
ORDER BY count DESC;
```

### Find Crags with Low Confidence

```sql
-- Note: Confidence not stored in DB, but method indicates quality
-- 'geometry' typically has highest confidence
-- 'terrain' typically has lowest confidence
SELECT name, aspect, aspect_calculation_method
FROM crags
WHERE aspect_calculation_method IN ('terrain')
ORDER BY name;
```

### Verify Specific Crag

Check individual crag calculations:

```sql
SELECT
  name,
  aspect,
  aspect_calculation_method,
  wall_geometry IS NOT NULL as has_geometry,
  jsonb_array_length(wall_geometry) as geometry_points
FROM crags
WHERE name ILIKE '%kolsås%' OR name ILIKE '%damtjern%';
```

---

## Benefits

1. **Accuracy**: Wall aspects now represent actual wall face direction
2. **Transparency**: Method tracking shows calculation reliability
3. **Fallback System**: Robust multi-method approach handles missing data
4. **Geometry Leverage**: Uses OSM way data when available for highest accuracy
5. **Cliff Detection**: Better identifies vertical faces vs gradual slopes
6. **Confidence Scoring**: Indicates calculation reliability for future improvements

---

## Technical Notes

### Why Use Bearing Direction Directly?

The bearing along the wall base (A→B) represents the direction the wall runs/faces. This is the wall aspect. The algorithm:
- Computes bearing along wall: 90° (due East)
- This IS the wall aspect: The wall runs East
- No perpendicular calculation needed

### Circular Averaging for Angles

Standard arithmetic averaging fails for angles near 0°/360°:
- Wrong: (350° + 10°) / 2 = 180°
- Right: Convert to vectors, average, convert back = 0°

The implementation uses:
```typescript
sumX += Math.cos(angle) * weight;
sumY += Math.sin(angle) * weight;
result = atan2(sumY, sumX);
```

### Grid Size Choice

7×7 grid chosen because:
- Large enough to detect cliffs (need ~150m sampling area)
- Small enough to avoid rate limits (49 points per request)
- Odd dimension ensures center point exists
- Provides 2-point radius for directional analysis

---

## Troubleshooting

### If aspects still seem wrong:

1. Check if crag has geometry data
2. Verify geometry points form a line (not scattered)
3. Review calculation method used
4. Compare with OSM data visually
5. Consider manual aspect override for problematic crags

### If recalculation fails:

1. Check Supabase edge function is deployed
2. Verify environment variables are set
3. Check OpenTopoData API is accessible
4. Reduce batch size if timing out
5. Increase delay between batches if rate limited

---

## Summary

The wall aspect calculation has been completely reimplemented to properly represent climbing wall face orientation rather than terrain slope direction. The system now uses OSM geometry data when available, falls back to improved cliff detection, and provides transparency through calculation method tracking. All existing crags should be recalculated using the new script to benefit from these improvements.

**Key Improvement**: Aspects now show which direction the wall FACES (for weather/sun exposure) rather than which direction the slope POINTS (perpendicular to the actual wall).
