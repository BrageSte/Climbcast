import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Crag } from '../types';

export function useCrags() {
  return useQuery<Crag[], Error>({
    queryKey: ['crags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crags')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
