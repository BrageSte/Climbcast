import { useState, useEffect } from 'react';
import type { FilterOptions } from '../components/FilterPanel';

const STORAGE_KEY = 'klatrevaer_best_now_filters';

const DEFAULT_FILTERS: FilterOptions = {
  minScore: 'all',
  regions: [],
  rockTypes: [],
  climbingTypes: [],
};

export function useBestNowFilters() {
  const [filters, setFilters] = useState<FilterOptions>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
    }
    return DEFAULT_FILTERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }, [filters]);

  return { filters, setFilters };
}
