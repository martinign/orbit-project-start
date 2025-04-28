import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectInvitation {
  id: string;
  inviter: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  };
  invitee: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  };
  status: string;
}

export function useProjectInvitations(projectId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['project_invitations', projectId];

  const query = useQuery<ProjectInvitation[], Error>({
    queryKey,
    enabled: !!projectId,
    staleTime: 30_000,            // cache results for 30s
    refetchOnWindowFocus: true,   // revalidate on window focus
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_invitations')
        .select(`
          id,
          status,
          inviter:inviter_id(id, full_name, last_name),
          invitee:invitee_id(id, full_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ProjectInvitation[];
    },
  });

  // Realtime subscription: invalidate on any INSERT/UPDATE/DELETE
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project_invitations_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_invitations',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries(queryKey);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient, queryKey]);

  return {
    invitations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
