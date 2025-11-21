import type { Crag, HourPoint, CragWithMetrics } from '../types';
import { computeFriction } from './frictionCalculator';
import { calculateWetnessScore } from './wetnessCalculator';

export interface RankingOptions {
  minWetnessThreshold?: number;
  excludeHeavyRain?: boolean;
  userLatitude?: number;
  userLongitude?: number;
  maxDistance?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getBestCragsNow(
  crags: Crag[],
  weatherMap: Map<string, HourPoint[]>,
  options: RankingOptions = {}
): CragWithMetrics[] {
  const {
    minWetnessThreshold = 40,
    excludeHeavyRain = true,
    userLatitude,
    userLongitude,
    maxDistance,
  } = options;

  const rankedCrags: CragWithMetrics[] = [];

  for (const crag of crags) {
    const weatherHistory = weatherMap.get(crag.id);
    if (!weatherHistory || weatherHistory.length === 0) {
      continue;
    }

    const currentWeather = weatherHistory[0];

    if (excludeHeavyRain && currentWeather.precipitation > 2) {
      continue;
    }

    const wetnessData = calculateWetnessScore(currentWeather, weatherHistory);

    if (wetnessData.dryness < minWetnessThreshold) {
      continue;
    }

    const frictionData = computeFriction(currentWeather, crag.aspect);

    let distanceFromUser: number | undefined;
    if (userLatitude !== undefined && userLongitude !== undefined) {
      distanceFromUser = calculateDistance(
        userLatitude,
        userLongitude,
        crag.latitude,
        crag.longitude
      );

      if (maxDistance && distanceFromUser > maxDistance) {
        continue;
      }
    }

    const goodnessIndex = frictionData.score * 100;

    rankedCrags.push({
      ...crag,
      currentMetrics: {
        wetnessScore: wetnessData.dryness,
        frictionScore: frictionData.score * 100,
        sunExposure: currentWeather.cloudCover < 50,
        goodnessIndex,
      },
      distanceFromUser,
    });
  }

  rankedCrags.sort((a, b) => {
    const scoreA = a.currentMetrics?.goodnessIndex ?? 0;
    const scoreB = b.currentMetrics?.goodnessIndex ?? 0;

    if (Math.abs(scoreA - scoreB) > 5) {
      return scoreB - scoreA;
    }

    if (a.distanceFromUser !== undefined && b.distanceFromUser !== undefined) {
      return a.distanceFromUser - b.distanceFromUser;
    }

    return scoreB - scoreA;
  });

  return rankedCrags;
}

export function getBestCragsLaterToday(
  crags: Crag[],
  weatherMap: Map<string, HourPoint[]>,
  options: RankingOptions = {}
): Array<CragWithMetrics & { bestHourIndex: number; bestHourScore: number }> {
  const rankedCrags: Array<CragWithMetrics & { bestHourIndex: number; bestHourScore: number }> = [];

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  for (const crag of crags) {
    const weatherHistory = weatherMap.get(crag.id);
    if (!weatherHistory || weatherHistory.length === 0) {
      continue;
    }

    let bestHourIndex = -1;
    let bestHourScore = 0;

    weatherHistory.forEach((hour, index) => {
      const hourTime = new Date(hour.time);
      if (hourTime > now && hourTime <= endOfDay) {
        const frictionData = computeFriction(hour, crag.aspect);
        const wetnessData = calculateWetnessScore(hour, weatherHistory.slice(0, index + 1));

        const combinedScore = (frictionData.score * 0.7 + (wetnessData.dryness / 100) * 0.3) * 100;

        if (combinedScore > bestHourScore) {
          bestHourScore = combinedScore;
          bestHourIndex = index;
        }
      }
    });

    if (bestHourIndex >= 0 && bestHourScore > 50) {
      const bestHour = weatherHistory[bestHourIndex];
      const wetnessData = calculateWetnessScore(bestHour, weatherHistory.slice(0, bestHourIndex + 1));
      const frictionData = computeFriction(bestHour, crag.aspect);

      let distanceFromUser: number | undefined;
      if (options.userLatitude !== undefined && options.userLongitude !== undefined) {
        distanceFromUser = calculateDistance(
          options.userLatitude,
          options.userLongitude,
          crag.latitude,
          crag.longitude
        );
      }

      rankedCrags.push({
        ...crag,
        currentMetrics: {
          wetnessScore: wetnessData.dryness,
          frictionScore: frictionData.score * 100,
          sunExposure: bestHour.cloudCover < 50,
          goodnessIndex: bestHourScore,
        },
        distanceFromUser,
        bestHourIndex,
        bestHourScore,
      });
    }
  }

  rankedCrags.sort((a, b) => b.bestHourScore - a.bestHourScore);

  return rankedCrags;
}
