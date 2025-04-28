import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useInvitationsCount() {
  // 1) Track the current user’s ID
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMounted) setUserId(user?.id ?? null);
    });

    // Listen for auth changes (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const queryClient = useQueryClient();
  const queryKey = ['pending_invitations_count', userId];

  // 2) Fetch the count via React-Query
  const query = useQuery<number>({
    queryKey,
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('project_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('invitee_id', userId!)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching invitations count:', error);
        return 0;
      }
      return count ?? 0;
    },
    staleTime: 30_000,           // cache for 30s
    refetchOnWindowFocus: true,  // auto-refetch on focus
  });

  // 3) Realtime subscription scoped to this user
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`invitations_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_invitations',
          filter: `invitee_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries(queryKey);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, queryKey]);

  // 4) Return full query state
  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
