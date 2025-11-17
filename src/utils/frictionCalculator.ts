import type { HourPoint, FrictionScore } from '../types';

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function calculateWindAspectScore(
  windDirection: number,
  wallAspect: number
): { score: number; reason: string } {
  const aspectDiff = Math.abs(normalizeAngle(windDirection - wallAspect));
  const minDiff = Math.min(aspectDiff, 360 - aspectDiff);

  if (minDiff >= 75 && minDiff <= 105) {
    return { score: 1.0, reason: 'Wind perpendicular to wall (optimal drying)' };
  } else if (minDiff >= 45 && minDiff <= 135) {
    return { score: 0.7, reason: 'Good wind angle for drying' };
  } else if (minDiff >= 135 && minDiff <= 180) {
    return { score: 0.3, reason: 'Wind from behind (poor drying)' };
  } else {
    return { score: 0.1, reason: 'Wind directly at wall (no drying effect)' };
  }
}

function calculateWindSpeedScore(windSpeed: number): { score: number; reason: string } {
  if (windSpeed >= 3 && windSpeed <= 7) {
    return { score: 1.0, reason: 'Moderate wind (good for drying)' };
  } else if (windSpeed >= 1.5 && windSpeed < 3) {
    return { score: 0.7, reason: 'Light breeze (some drying effect)' };
  } else if (windSpeed >= 7 && windSpeed <= 10) {
    return { score: 0.6, reason: 'Strong wind (may affect climbing)' };
  } else if (windSpeed > 10) {
    return { score: 0.3, reason: 'Very strong wind (difficult conditions)' };
  } else {
    return { score: 0.4, reason: 'Calm conditions (slow drying)' };
  }
}

function calculateHumidityScore(humidity: number): { score: number; reason: string } {
  if (humidity <= 40) {
    return { score: 1.0, reason: 'Very low humidity (excellent friction)' };
  } else if (humidity <= 60) {
    return { score: 0.8, reason: 'Moderate humidity (good friction)' };
  } else if (humidity <= 70) {
    return { score: 0.5, reason: 'Elevated humidity (fair friction)' };
  } else if (humidity <= 80) {
    return { score: 0.2, reason: 'High humidity (poor friction)' };
  } else {
    return { score: -0.2, reason: 'Very high humidity (slippery)' };
  }
}

function calculateTemperatureScore(temperature: number): { score: number; reason: string } {
  if (temperature >= 8 && temperature <= 18) {
    return { score: 1.0, reason: 'Optimal temperature range (8-18°C)' };
  } else if (temperature >= 5 && temperature <= 22) {
    return { score: 0.7, reason: 'Good temperature (5-22°C)' };
  } else if (temperature >= 0 && temperature <= 25) {
    return { score: 0.4, reason: 'Acceptable temperature' };
  } else if (temperature < 0) {
    return { score: 0.0, reason: 'Below freezing (rock may be icy)' };
  } else {
    return { score: 0.2, reason: 'Too warm (sweaty hands)' };
  }
}

function calculateCloudCoverFactor(cloudCover: number): { factor: number; reason: string } {
  if (cloudCover <= 30) {
    return { factor: 1.0, reason: 'Clear skies' };
  } else if (cloudCover <= 70) {
    return { factor: 0.95, reason: 'Partly cloudy' };
  } else {
    return { factor: 0.9, reason: 'Overcast' };
  }
}

function computeFrictionWithAspect(
  hour: HourPoint,
  wallAspect: number
): FrictionScore {
  const reasons: string[] = [];

  const windAspect = calculateWindAspectScore(hour.windDirection, wallAspect);
  const humidity = calculateHumidityScore(hour.humidity);
  const temperature = calculateTemperatureScore(hour.temperature);
  const cloudCover = calculateCloudCoverFactor(hour.cloudCover);

  reasons.push(windAspect.reason);
  reasons.push(humidity.reason);
  reasons.push(temperature.reason);
  if (cloudCover.factor < 1.0) {
    reasons.push(cloudCover.reason);
  }

  const baseScore = (windAspect.score * 0.3) + (humidity.score * 0.4) + (temperature.score * 0.3);
  const finalScore = baseScore * cloudCover.factor;

  let label: 'Perfect' | 'OK' | 'Poor';
  if (finalScore >= 0.7) {
    label = 'Perfect';
  } else if (finalScore >= 0.4) {
    label = 'OK';
  } else {
    label = 'Poor';
  }

  return {
    score: Math.round(finalScore * 100) / 100,
    label,
    reasons,
    hasAspectData: true,
  };
}

function computeFrictionWithoutAspect(
  hour: HourPoint
): FrictionScore {
  const reasons: string[] = [];

  const humidity = calculateHumidityScore(hour.humidity);
  const temperature = calculateTemperatureScore(hour.temperature);
  const windSpeed = calculateWindSpeedScore(hour.windSpeed);
  const cloudCover = calculateCloudCoverFactor(hour.cloudCover);

  reasons.push(humidity.reason);
  reasons.push(temperature.reason);
  reasons.push(windSpeed.reason);
  if (cloudCover.factor < 1.0) {
    reasons.push(cloudCover.reason);
  }

  const baseScore = (humidity.score * 0.55) + (temperature.score * 0.35) + (windSpeed.score * 0.1);
  const finalScore = baseScore * cloudCover.factor;

  let label: 'Perfect' | 'OK' | 'Poor';
  if (finalScore >= 0.7) {
    label = 'Perfect';
  } else if (finalScore >= 0.4) {
    label = 'OK';
  } else {
    label = 'Poor';
  }

  return {
    score: Math.round(finalScore * 100) / 100,
    label,
    reasons,
    hasAspectData: false,
  };
}

export function computeFriction(
  hour: HourPoint,
  wallAspect: number | null
): FrictionScore {
  if (wallAspect !== null) {
    return computeFrictionWithAspect(hour, wallAspect);
  } else {
    return computeFrictionWithoutAspect(hour);
  }
}
