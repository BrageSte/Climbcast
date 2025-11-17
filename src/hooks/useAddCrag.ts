import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { NewCragData } from '../components/AddCragForm';
import { autoCalculateAspect } from '../utils/aspectAutoCalculator';

export function useAddCrag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cragData: NewCragData) => {
      const { data: existingCrags, error: checkError } = await supabase
        .from('crags')
        .select('id, name')
        .ilike('name', cragData.name)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (existingCrags && existingCrags.length > 0) {
        throw new Error(`Et klatrefelt med navnet "${cragData.name}" eksisterer allerede`);
      }

      const { data, error } = await supabase
        .from('crags')
        .insert({
          name: cragData.name,
          latitude: cragData.latitude,
          longitude: cragData.longitude,
          aspect: cragData.aspect,
          climbing_types: cragData.climbing_types,
          region: cragData.region,
          description: cragData.description || null,
          rock_type: cragData.rock_type || null,
          rock_source: 'Manual',
          rock_confidence: 100,
          source: 'Manual',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crags'] });

      if (data.aspect === null) {
        autoCalculateAspect(data.id, data.latitude, data.longitude);
      }
    },
  });
}
