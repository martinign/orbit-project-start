
import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

// Helper for debounced query invalidation
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  
  // Create debounced invalidation functions to prevent UI freezes
  const debouncedInvalidateProjects = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateTasks = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
      queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateInvitations = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateEvents = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
    }, 300),
    [queryClient]
  );

  // Use custom realtime subscription hooks
  useRealtimeSubscription({
    table: 'projects',
    onRecordChange: debouncedInvalidateProjects
  });

  useRealtimeSubscription({
    table: 'project_tasks',
    onRecordChange: debouncedInvalidateTasks
  });

  useRealtimeSubscription({
    table: 'project_invitations',
    onRecordChange: debouncedInvalidateInvitations
  });

  useRealtimeSubscription({
    table: 'project_events',
    onRecordChange: debouncedInvalidateEvents
  });

  // Initial data fetch
  useEffect(() => {
    const invalidateAll = debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
      queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_tasks"] });
    }, 300);
    
    invalidateAll();
  }, [queryClient]);
}
