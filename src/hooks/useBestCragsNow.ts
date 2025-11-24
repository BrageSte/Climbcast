import { useMemo } from 'react';
import type { HomeCragSummary } from '../types';

export function useBestCragsNow() {
  const data = useMemo<HomeCragSummary[]>(() => [
    {
      id: '1',
      name: 'Kolsås',
      region: 'Oslo',
      wetnessScore: 18,
      frictionScore: 85,
      summary: 'Cool, dry, in shade'
    },
    {
      id: '2',
      name: 'Hellerud',
      region: 'Oslo',
      wetnessScore: 24,
      frictionScore: 78,
      summary: 'Light breeze, good conditions'
    },
    {
      id: '3',
      name: 'Kampen',
      region: 'Oslo',
      wetnessScore: 32,
      frictionScore: 72,
      summary: 'Sunny and dry'
    }
  ], []);

  return {
    data,
    isLoading: false,
    error: undefined
  };
}
