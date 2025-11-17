import { supabase } from '../lib/supabase';
import { fetchNGURockType } from '../api/ngu';
import {
  normalizeNGURockType,
  normalizeOSMRockType,
  type RockTypeInfo,
} from '../utils/rockTypeNormalizer';
import { inferRockTypeFromRegion } from '../utils/regionalInference';

export async function resolveRockTypeForCrag(
  cragId: string,
  latitude: number,
  longitude: number,
  osmRockType?: string | null,
  osmTagName?: string | null
): Promise<RockTypeInfo | null> {
  const { data: existingCrag } = await supabase
    .from('crags')
    .select('rock_type, rock_source, rock_confidence')
    .eq('id', cragId)
    .maybeSingle();

  if (existingCrag?.rock_source === 'Manual') {
    return {
      type: existingCrag.rock_type,
      source: 'Manual',
      confidence: 100,
      raw: 'Manual entry',
    };
  }

  if (osmRockType && osmTagName) {
    const osmInfo = normalizeOSMRockType(osmRockType, osmTagName);

    if (!existingCrag || (existingCrag.rock_confidence ?? 0) < osmInfo.confidence) {
      await supabase
        .from('crags')
        .update({
          rock_type: osmInfo.type,
          rock_source: osmInfo.source,
          rock_confidence: osmInfo.confidence,
          rock_raw: osmInfo.raw,
        })
        .eq('id', cragId);

      return osmInfo;
    }
  }

  try {
    const nguRockType = await fetchNGURockType(latitude, longitude);

    if (nguRockType) {
      const nguInfo = normalizeNGURockType(nguRockType);

      if (!existingCrag || (existingCrag.rock_confidence ?? 0) < nguInfo.confidence) {
        await supabase
          .from('crags')
          .update({
            rock_type: nguInfo.type,
            rock_source: nguInfo.source,
            rock_confidence: nguInfo.confidence,
            rock_raw: nguInfo.raw,
          })
          .eq('id', cragId);

        return nguInfo;
      }
    }
  } catch (error) {
    console.error('Error fetching NGU rock type:', error);
  }

  const inferredInfo = inferRockTypeFromRegion(latitude, longitude);

  if (inferredInfo) {
    if (!existingCrag || (existingCrag.rock_confidence ?? 0) < inferredInfo.confidence) {
      await supabase
        .from('crags')
        .update({
          rock_type: inferredInfo.type,
          rock_source: inferredInfo.source,
          rock_confidence: inferredInfo.confidence,
          rock_raw: inferredInfo.raw,
        })
        .eq('id', cragId);

      return inferredInfo;
    }
  }

  if (existingCrag?.rock_type) {
    return {
      type: existingCrag.rock_type,
      source: existingCrag.rock_source,
      confidence: existingCrag.rock_confidence,
      raw: 'Cached value',
    };
  }

  return null;
}

export async function enrichCragWithRockType(cragId: string): Promise<void> {
  const { data: crag } = await supabase
    .from('crags')
    .select('latitude, longitude, rock_type, rock_source')
    .eq('id', cragId)
    .maybeSingle();

  if (!crag) {
    return;
  }

  if (crag.rock_source === 'Manual') {
    return;
  }

  await resolveRockTypeForCrag(cragId, crag.latitude, crag.longitude);
}
