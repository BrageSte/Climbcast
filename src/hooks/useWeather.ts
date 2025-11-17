import { useQuery } from '@tanstack/react-query';
import { fetchMETForecast } from '../api/metNorway';
import { fetchMultipleDaysSunriseSunset, type SunriseSunsetData } from '../api/sunriseSunset';
import type { HourPoint } from '../types';
import { format } from 'date-fns';

interface WeatherWithSunriseSunset {
  hours: HourPoint[];
  sunriseSunset: Map<string, SunriseSunsetData>;
}

export function useWeather(latitude: number, longitude: number) {
  return useQuery<WeatherWithSunriseSunset, Error>({
    queryKey: ['weather', latitude, longitude],
    queryFn: async () => {
      const hours = await fetchMETForecast(latitude, longitude);

      const uniqueDates = new Set<string>();
      hours.forEach(hour => {
        const date = format(new Date(hour.time), 'yyyy-MM-dd');
        uniqueDates.add(date);
      });

      const sunriseSunset = await fetchMultipleDaysSunriseSunset(
        latitude,
        longitude,
        Array.from(uniqueDates)
      );

      return { hours, sunriseSunset };
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
