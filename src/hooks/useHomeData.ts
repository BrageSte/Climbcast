import { useMemo } from 'react';
import type { HeroCard, FavoriteCragCard, WatchlistCragCard } from '../types';

export function useHomeData() {
  const heroCards = useMemo<HeroCard[]>(() => [
    {
      id: '1',
      type: 'best-now',
      title: 'Beste forhold nå',
      subtitle: 'Dine klatreforhold i dag',
      cragName: 'Kolsås',
      cragId: '1',
      location: 'Kolsås',
      region: 'Oslo',
      score: 92,
      temperature: 18,
      wind: '3 m/s',
      humidity: 62,
      statusLabel: 'Tørr',
      reliability: 'high'
    },
    {
      id: '2',
      type: 'project-update',
      title: 'Gode forhold snart',
      subtitle: 'Hold øye med vindskifte',
      cragName: 'Siurana',
      cragId: '2',
      timeWindow: '26–28 nov',
      location: 'Siurana',
      region: 'Catalonia, Spain',
      score: 89,
      temperature: 16,
      wind: '5 m/s',
      humidity: 55,
      statusLabel: 'Tørr',
      reliability: 'medium',
      timeframeLabel: 'Nærmeste 3 dager'
    }
  ], []);

  const favoriteCragCards = useMemo<FavoriteCragCard[]>(() => [
    {
      id: '1',
      name: 'Kolsås',
      region: 'Oslo',
      frictionScore: 85,
      trend: 'up',
      isWet: false,
      wetnessScore: 18,
      windDirection: 270,
      wallAspect: 180,
      windSpeed: 2.3,
      temperature: 18,
      humidity: 62,
      conditionLabel: 'Tørr',
      nextWindow: 'Nå',
      statusNote: 'Høy pålitelighet'
    },
    {
      id: '2',
      name: 'Hellerud',
      region: 'Oslo',
      frictionScore: 78,
      trend: 'same',
      isWet: false,
      wetnessScore: 24,
      windDirection: 90,
      wallAspect: 90,
      windSpeed: 1.8,
      temperature: 17,
      humidity: 58,
      conditionLabel: 'Tørr',
      nextWindow: '14:00',
      statusNote: 'Stabile forhold'
    },
    {
      id: '3',
      name: 'Kampen',
      region: 'Oslo',
      frictionScore: 72,
      trend: 'down',
      isWet: false,
      wetnessScore: 32,
      windDirection: 180,
      wallAspect: 270,
      windSpeed: 3.1,
      temperature: 16,
      humidity: 64,
      conditionLabel: 'Tørr',
      nextWindow: '16:00',
      statusNote: 'Lettere trekk'
    }
  ], []);

  const watchlistCrags = useMemo<WatchlistCragCard[]>(() => [
    {
      id: '4',
      name: 'Siurana',
      region: 'Catalonia, Spain',
      statusNote: 'Svært tørr de neste dagene',
      frictionScore: 88,
      temperature: 19,
      wind: '5 m/s',
      nextWindow: 'Nærmeste 3 dager'
    },
    {
      id: '5',
      name: 'Kalymnos',
      region: 'Dodekanesane, Hellas',
      statusNote: 'Bedre kveldsforhold etter 18:00',
      frictionScore: 82,
      temperature: 21,
      wind: '4 m/s',
      nextWindow: 'Etter 18:00'
    }
  ], []);

  return {
    heroCards,
    favoriteCragCards,
    watchlistCrags,
    isLoading: false,
    error: undefined
  };
}
