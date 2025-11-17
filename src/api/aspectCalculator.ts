export interface AspectResult {
  lat: number;
  lon: number;
  aspectDeg: number;
  aspectDir: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  provider: string;
}

export interface AspectError {
  error: string;
  details?: string;
}

const ASPECT_CALCULATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aspect-calculator`;

export async function calculateAspect(
  latitude: number,
  longitude: number,
  provider: 'opentopodata' = 'opentopodata'
): Promise<AspectResult> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    provider,
  });

  const url = `${ASPECT_CALCULATOR_URL}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: AspectError = await response.json().catch(() => ({
        error: 'Unknown error'
      }));
      throw new Error(errorData.details || errorData.error || `Aspect API error: ${response.status}`);
    }

    const data: AspectResult = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Aspect calculation request timed out after 15 seconds');
      }
      throw error;
    }

    throw new Error('Unknown error calculating aspect');
  }
}

export async function calculateAspectWithRetry(
  latitude: number,
  longitude: number,
  maxRetries: number = 2
): Promise<AspectResult | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await calculateAspect(latitude, longitude);
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        console.error(
          `Failed to calculate aspect for (${latitude}, ${longitude}) after ${maxRetries + 1} attempts:`,
          error instanceof Error ? error.message : error
        );
        return null;
      }

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return null;
}
