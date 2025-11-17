import type { HourPoint } from '../types';

export type WetnessLevel = 'Very Wet' | 'Wet' | 'Moist' | 'Dry' | 'Super Dry';

export interface WetnessScore {
  level: WetnessLevel;
  score: number;
  dryness: number;
  color: string;
  description: string;
  estimatedDryingHours: number | null;
}

function calculateRecentPrecipitation(hours: HourPoint[], lookbackHours: number = 24): number {
  const now = new Date();
  const cutoff = new Date(now.getTime() - lookbackHours * 60 * 60 * 1000);

  return hours
    .filter(h => new Date(h.time) >= cutoff)
    .reduce((sum, h) => sum + h.precipitation, 0);
}

function calculateDryingRate(temperature: number, humidity: number, windSpeed: number): number {
  const tempFactor = Math.max(0, (temperature - 5) / 20);
  const humidityFactor = Math.max(0, (100 - humidity) / 100);
  const windFactor = Math.min(1, windSpeed / 10);

  return (tempFactor * 0.4 + humidityFactor * 0.4 + windFactor * 0.2);
}

function estimateDryingTime(
  currentMoisture: number,
  avgDryingRate: number
): number | null {
  if (currentMoisture <= 0.2) return null;

  if (avgDryingRate < 0.1) return 48;

  const baseHours = (currentMoisture - 0.2) * 40;
  const adjustedHours = baseHours / Math.max(0.1, avgDryingRate);

  return Math.min(48, Math.max(0, adjustedHours));
}

export function calculateWetnessScore(
  currentWeather: HourPoint,
  weatherHistory: HourPoint[]
): WetnessScore {
  const recentPrecip24h = calculateRecentPrecipitation(weatherHistory, 24);
  const recentPrecip12h = calculateRecentPrecipitation(weatherHistory, 12);
  const recentPrecip6h = calculateRecentPrecipitation(weatherHistory, 6);

  const currentPrecip = currentWeather.precipitation;
  const humidity = currentWeather.humidity;
  const temperature = currentWeather.temperature;

  let moistureScore = 0;

  if (currentPrecip > 0) {
    moistureScore += 40;
  }

  moistureScore += Math.min(30, recentPrecip6h * 15);
  moistureScore += Math.min(20, recentPrecip12h * 8);
  moistureScore += Math.min(10, recentPrecip24h * 3);

  if (humidity > 85) {
    moistureScore += 15;
  } else if (humidity > 75) {
    moistureScore += 10;
  } else if (humidity > 65) {
    moistureScore += 5;
  }

  if (temperature < 5) {
    moistureScore += 10;
  }

  moistureScore = Math.min(100, moistureScore);

  const dryingRate = calculateDryingRate(
    currentWeather.temperature,
    currentWeather.humidity,
    currentWeather.windSpeed
  );

  const normalizedMoisture = moistureScore / 100;
  const estimatedDryingHours = estimateDryingTime(normalizedMoisture, dryingRate);

  let level: WetnessLevel;
  let color: string;
  let description: string;

  if (moistureScore >= 70) {
    level = 'Very Wet';
    color = '#1e40af';
    description = 'Rock is very wet. Not suitable for climbing. Wait for better conditions.';
  } else if (moistureScore >= 45) {
    level = 'Wet';
    color = '#3b82f6';
    description = 'Rock is wet. High slip risk. Allow more drying time before climbing.';
  } else if (moistureScore >= 25) {
    level = 'Moist';
    color = '#60a5fa';
    description = 'Rock is slightly damp. Approach with caution, friction may be reduced.';
  } else if (moistureScore >= 10) {
    level = 'Dry';
    color = '#fbbf24';
    description = 'Rock is dry. Good conditions for climbing.';
  } else {
    level = 'Super Dry';
    color = '#f59e0b';
    description = 'Rock is very dry. Excellent friction and optimal climbing conditions.';
  }

  return {
    level,
    score: moistureScore,
    dryness: 100 - moistureScore,
    color,
    description,
    estimatedDryingHours,
  };
}
