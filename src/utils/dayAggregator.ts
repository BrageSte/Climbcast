import { format } from 'date-fns';
import type { HourPoint, DayAggregate, BestWindow, FrictionScore } from '../types';
import { computeFriction } from './frictionCalculator';

function findBestWindow(
  hourlyScores: Array<{ hour: number; score: FrictionScore }>,
  sunriseHour: number,
  sunsetHour: number,
  windowSize: number = 3
): BestWindow | null {
  const daylightScores = hourlyScores.filter(
    item => item.hour >= sunriseHour && item.hour <= sunsetHour
  );

  if (daylightScores.length < windowSize) {
    return null;
  }

  let bestWindow: BestWindow | null = null;
  let bestAvgScore = -1;

  for (let i = 0; i <= daylightScores.length - windowSize; i++) {
    const windowScores = daylightScores.slice(i, i + windowSize);
    const avgScore = windowScores.reduce((sum, item) => sum + item.score.score, 0) / windowSize;

    if (avgScore > bestAvgScore) {
      bestAvgScore = avgScore;
      bestWindow = {
        startHour: windowScores[0].hour,
        endHour: windowScores[windowScores.length - 1].hour,
        avgScore: Math.round(avgScore * 100) / 100,
      };
    }
  }

  return bestWindow;
}

function calculateDayRating(hourlyScores: Array<{ score: FrictionScore }>): 'Perfect' | 'OK' | 'Poor' {
  const perfectHours = hourlyScores.filter(h => h.score.label === 'Perfect').length;
  const okHours = hourlyScores.filter(h => h.score.label === 'OK').length;
  const goodHours = perfectHours + okHours;

  if (perfectHours >= 4 || goodHours >= 8) {
    return 'Perfect';
  } else if (goodHours >= 2) {
    return 'OK';
  } else {
    return 'Poor';
  }
}

function getHourFromTime(time: string): number {
  const date = new Date(time);
  return date.getHours();
}

export function aggregateDay(
  hours: HourPoint[],
  wallAspect: number | null,
  sunrise: string | null,
  sunset: string | null
): DayAggregate {
  if (hours.length === 0) {
    throw new Error('Cannot aggregate empty hour array');
  }

  const date = format(new Date(hours[0].time), 'yyyy-MM-dd');

  const sunriseHour = sunrise ? getHourFromTime(sunrise) : 0;
  const sunsetHour = sunset ? getHourFromTime(sunset) : 23;

  const hourlyScores = hours.map(hour => ({
    hour: getHourFromTime(hour.time),
    score: computeFriction(hour, wallAspect),
  }));

  const rating = calculateDayRating(hourlyScores);

  const bestWindow = findBestWindow(hourlyScores, sunriseHour, sunsetHour, 3);

  const heatbar = hourlyScores.map(({ hour, score }) => ({
    hour,
    quality: score.label.toLowerCase() as 'perfect' | 'ok' | 'poor',
    isDaylight: hour >= sunriseHour && hour <= sunsetHour,
  }));

  const temperatures = hours.map(h => h.temperature);
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);

  const totalPrecipitation = hours.reduce((sum, h) => sum + h.precipitation, 0);

  return {
    date,
    rating,
    bestWindow,
    heatbar,
    minTemp: Math.round(minTemp * 10) / 10,
    maxTemp: Math.round(maxTemp * 10) / 10,
    totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
    sunrise,
    sunset,
  };
}

export function groupHoursByDay(hours: HourPoint[]): HourPoint[][] {
  const dayGroups: Map<string, HourPoint[]> = new Map();

  hours.forEach(hour => {
    const dayKey = format(new Date(hour.time), 'yyyy-MM-dd');
    if (!dayGroups.has(dayKey)) {
      dayGroups.set(dayKey, []);
    }
    dayGroups.get(dayKey)!.push(hour);
  });

  return Array.from(dayGroups.values());
}
