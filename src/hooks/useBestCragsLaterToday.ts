import { useMemo } from 'react';
import type { TimeWindowSuggestion } from '../types';

export function useBestCragsLaterToday() {
  const data = useMemo<TimeWindowSuggestion[]>(() => [
    {
      cragName: 'Hellerud',
      timeWindow: '16–19',
      summary: 'Cool and shaded, optimal friction',
      cragId: '2'
    },
    {
      cragName: 'Moss',
      timeWindow: '10–13',
      summary: 'Good friction, light breeze',
      cragId: '4'
    }
  ], []);

  return {
    data,
    isLoading: false,
    error: undefined
  };
}
