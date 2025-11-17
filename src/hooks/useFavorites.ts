import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

function getSessionId(): string {
  let sessionId = localStorage.getItem('climbing_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('climbing_session_id', sessionId);
  }
  return sessionId;
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: favorites = [], isLoading } = useQuery<string[], Error>({
    queryKey: ['favorites', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('crag_id')
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }

      return data.map(f => f.crag_id);
    },
    staleTime: 5 * 60 * 1000,
  });

  const addFavorite = useMutation({
    mutationFn: async (cragId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          crag_id: cragId,
          session_id: sessionId,
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', sessionId] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (cragId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('crag_id', cragId)
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', sessionId] });
    },
  });

  const toggleFavorite = (cragId: string) => {
    if (favorites.includes(cragId)) {
      removeFavorite.mutate(cragId);
    } else {
      addFavorite.mutate(cragId);
    }
  };

  const isFavorite = (cragId: string) => favorites.includes(cragId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
  };
}
