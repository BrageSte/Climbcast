import type { METResponse, HourPoint } from '../types';

const WEATHER_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather-proxy`;

function roundCoordinate(coord: number, decimals: number = 2): number {
  return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function parseHourPoint(item: METResponse['properties']['timeseries'][0]): HourPoint {
  const details = item.data.instant.details;
  const nextHour = item.data.next_1_hours;

  return {
    time: item.time,
    temperature: details.air_temperature,
    humidity: details.relative_humidity,
    windSpeed: details.wind_speed,
    windDirection: details.wind_from_direction,
    cloudCover: details.cloud_area_fraction,
    precipitation: nextHour?.details?.precipitation_amount || 0,
  };
}

export async function fetchMETForecast(
  latitude: number,
  longitude: number
): Promise<HourPoint[]> {
  const lat = roundCoordinate(latitude, 2);
  const lon = roundCoordinate(longitude, 2);

  const url = `${WEATHER_PROXY_URL}?lat=${lat}&lon=${lon}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Weather API error: ${response.status} ${response.statusText}`);
  }

  const data: METResponse = await response.json();

  const hourPoints = data.properties.timeseries
    .slice(0, 168)
    .map(parseHourPoint);

  return hourPoints;
}
