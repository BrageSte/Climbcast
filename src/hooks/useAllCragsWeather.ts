import { useQuery } from '@tanstack/react-query';
import { fetchMETForecast } from '../api/metNorway';
import type { Crag, HourPoint } from '../types';

interface CragWeatherMap {
  weatherMap: Map<string, HourPoint>;
}

async function fetchCragWeather(crag: Crag): Promise<{ cragId: string; weather: HourPoint | null }> {
  try {
    const hours = await fetchMETForecast(crag.latitude, crag.longitude);
    return {
      cragId: crag.id,
      weather: hours.length > 0 ? hours[0] : null,
    };
  } catch (error) {
    console.error(`Failed to fetch weather for ${crag.name}:`, error);
    return {
      cragId: crag.id,
      weather: null,
    };
  }
}

export function useAllCragsWeather(crags: Crag[] | undefined) {
  return useQuery<CragWeatherMap, Error>({
    queryKey: ['all-crags-weather', crags?.map(c => c.id).join(',')],
    queryFn: async () => {
      if (!crags || crags.length === 0) {
        return { weatherMap: new Map() };
      }

      const results = await Promise.allSettled(
        crags.map(crag => fetchCragWeather(crag))
      );

      const weatherMap = new Map<string, HourPoint>();

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.weather) {
          weatherMap.set(result.value.cragId, result.value.weather);
        }
      });

      return { weatherMap };
    },
    enabled: !!crags && crags.length > 0,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });
}
