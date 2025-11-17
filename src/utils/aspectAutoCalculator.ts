import { calculateAspect } from '../api/aspectCalculator';
import { supabase } from '../lib/supabase';

export async function autoCalculateAspect(
  cragId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  try {
    const result = await calculateAspect(latitude, longitude);

    if (result && result.aspectDeg !== null && result.aspectDeg !== undefined) {
      const { error } = await supabase
        .from('crags')
        .update({ aspect: result.aspectDeg })
        .eq('id', cragId);

      if (error) {
        console.warn('Failed to update aspect in database:', error);
      }
    }
  } catch (error) {
    console.warn('Auto-calculation of aspect failed:', error);
  }
}
