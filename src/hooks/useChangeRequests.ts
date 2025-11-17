import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { autoCalculateAspect } from '../utils/aspectAutoCalculator';

interface SubmitChangeRequestParams {
  cragId: string;
  requestedChanges: Record<string, unknown>;
  userComment: string;
  cragLatitude?: number;
  cragLongitude?: number;
}

export function useSubmitChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cragId,
      requestedChanges,
      userComment,
      cragLatitude,
      cragLongitude
    }: SubmitChangeRequestParams) => {
      const { data, error } = await supabase
        .from('crag_change_requests')
        .insert({
          crag_id: cragId,
          requested_changes: requestedChanges,
          user_comment: userComment || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const hasCoordinateChange =
        requestedChanges.latitude !== undefined ||
        requestedChanges.longitude !== undefined;

      if (hasCoordinateChange && cragLatitude !== undefined && cragLongitude !== undefined) {
        const newLat = (requestedChanges.latitude as number) ?? cragLatitude;
        const newLon = (requestedChanges.longitude as number) ?? cragLongitude;

        autoCalculateAspect(cragId, newLat, newLon);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
    },
  });
}
