import { useMemo } from 'react';
import type { HeroCard, FavoriteCragCard } from '../types';

export function useHomeData() {
  const heroCards = useMemo<HeroCard[]>(() => [
    {
      id: '1',
      type: 'best-now',
      title: 'Best conditions near you right now',
      subtitle: 'Kolsås – Friction score: 85',
      cragName: 'Kolsås',
      cragId: '1'
    },
    {
      id: '2',
      type: 'project-update',
      title: 'Project update',
      subtitle: 'Key hours today 16–19',
      cragName: 'Hellerud',
      cragId: '2',
      timeWindow: '16–19'
    }
  ], []);

  const favoriteCragCards = useMemo<FavoriteCragCard[]>(() => [
    {
      id: '1',
      name: 'Kolsås',
      frictionScore: 85,
      trend: 'up',
      isWet: false,
      wetnessScore: 18,
      windDirection: 270,
      wallAspect: 180,
      windSpeed: 2.3
    },
    {
      id: '2',
      name: 'Hellerud',
      frictionScore: 78,
      trend: 'same',
      isWet: false,
      wetnessScore: 24,
      windDirection: 90,
      wallAspect: 90,
      windSpeed: 1.8
    },
    {
      id: '3',
      name: 'Kampen',
      frictionScore: 72,
      trend: 'down',
      isWet: false,
      wetnessScore: 32,
      windDirection: 180,
      wallAspect: 270,
      windSpeed: 3.1
    }
  ], []);

  return {
    heroCards,
    favoriteCragCards,
    isLoading: false,
    error: undefined
  };
}
