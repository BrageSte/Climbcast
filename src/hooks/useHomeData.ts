import { useMemo } from 'react';
import { useCrags } from './useCrags';
import type { HeroCard, FavoriteCragCard, WatchlistCragCard } from '../types';

export function useHomeData() {
  const { data: crags = [], isLoading, error } = useCrags();

  const heroCards = useMemo<HeroCard[]>(() => {
    const heroTemplates = [
      {
        id: 'hero-1',
        type: 'best-now' as const,
        title: 'Beste forhold nå',
        subtitle: 'Dine klatreforhold i dag',
        cragName: 'Kolsås',
        location: 'Kolsås',
        region: 'Oslo',
        score: 92,
        temperature: 18,
        wind: '3 m/s',
        humidity: 62,
        statusLabel: 'Tørr',
        reliability: 'high' as const
      },
      {
        id: 'hero-2',
        type: 'project-update' as const,
        title: 'Gode forhold snart',
        subtitle: 'Hold øye med vindskifte',
        cragName: 'Siurana',
        timeWindow: '26–28 nov',
        location: 'Siurana',
        region: 'Catalonia, Spain',
        score: 89,
        temperature: 16,
        wind: '5 m/s',
        humidity: 55,
        statusLabel: 'Tørr',
        reliability: 'medium' as const,
        timeframeLabel: 'Nærmeste 3 dager'
      }
    ];

    return heroTemplates
      .map((template, index) => {
        const matchedCrag =
          crags.find((crag) => crag.name.toLowerCase() === template.cragName?.toLowerCase()) ??
          crags[index];

        const cragId = matchedCrag?.id;

        return {
          ...template,
          id: cragId ?? template.id,
          cragId,
          cragName: matchedCrag?.name ?? template.cragName,
          location: matchedCrag?.name ?? template.location,
          region: matchedCrag?.region ?? template.region
        } satisfies HeroCard;
      })
      .filter((card): card is HeroCard => Boolean(card.cragId));
  }, [crags]);

  const favoriteTemplates = [
    {
      id: 'fav-1',
      name: 'Kolsås',
      region: 'Oslo',
      frictionScore: 85,
      trend: 'up' as const,
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
      id: 'fav-2',
      name: 'Hellerud',
      region: 'Oslo',
      frictionScore: 78,
      trend: 'same' as const,
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
      id: 'fav-3',
      name: 'Kampen',
      region: 'Oslo',
      frictionScore: 72,
      trend: 'down' as const,
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
  ];

  const favoriteCragCards = useMemo<FavoriteCragCard[]>(() => {
    return favoriteTemplates
      .map((template, index) => {
        const matchedCrag =
          crags.find((crag) => crag.name.toLowerCase() === template.name.toLowerCase()) ??
          crags[index];

        const cragId = matchedCrag?.id;

        return {
          ...template,
          id: cragId ?? template.id,
          name: matchedCrag?.name ?? template.name,
          region: matchedCrag?.region ?? template.region,
        } satisfies FavoriteCragCard;
      })
      .filter((card): card is FavoriteCragCard => Boolean(card.id && crags.some((crag) => crag.id === card.id)));
  }, [crags]);

  const watchlistCrags = useMemo<WatchlistCragCard[]>(() => {
    const watchlistTemplates = [
      {
        id: 'watch-1',
        name: 'Siurana',
        region: 'Catalonia, Spain',
        statusNote: 'Svært tørr de neste dagene',
        frictionScore: 88,
        temperature: 19,
        wind: '5 m/s',
        nextWindow: 'Nærmeste 3 dager'
      },
      {
        id: 'watch-2',
        name: 'Kalymnos',
        region: 'Dodekanesane, Hellas',
        statusNote: 'Bedre kveldsforhold etter 18:00',
        frictionScore: 82,
        temperature: 21,
        wind: '4 m/s',
        nextWindow: 'Etter 18:00'
      }
    ];

    return watchlistTemplates
      .map((template, index) => {
        const matchedCrag =
          crags.find((crag) => crag.name.toLowerCase() === template.name.toLowerCase()) ??
          crags[index + favoriteTemplates.length];

        const cragId = matchedCrag?.id;

        return {
          ...template,
          id: cragId ?? template.id,
          name: matchedCrag?.name ?? template.name,
          region: matchedCrag?.region ?? template.region,
        } satisfies WatchlistCragCard;
      })
      .filter((card): card is WatchlistCragCard => Boolean(card.id && crags.some((crag) => crag.id === card.id)));
  }, [crags]);

  return {
    heroCards,
    favoriteCragCards,
    watchlistCrags,
    isLoading,
    error
  };
}
