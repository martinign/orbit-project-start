
import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  const channelsRef = useRef<any[]>([]);
  
  // Create debounced invalidation functions to prevent UI freezes
  const debouncedInvalidateQueries = useCallback(
    debounce((queryKeys: string[]) => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }, 300),
    [queryClient]
  );

  // Setup consolidated realtime subscriptions
  useEffect(() => {
    // Create a single channel for multiple table subscriptions
    const channel = supabase.channel('dashboard_realtime');
    
    // Project changes
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects'
    }, () => {
      debouncedInvalidateQueries(['projects_statistics', 'recent_activities']);
    });
    
    // Task changes
    channel.on('postgres_changes', {
      event: '*', 
      schema: 'public',
      table: 'project_tasks'
    }, () => {
      debouncedInvalidateQueries([
        'tasks_statistics', 
        'task_priorities', 
        'upcoming_tasks', 
        'recent_activities', 
        'new_tasks_count'
      ]);
    });
    
    // Invitation changes
    channel.on('postgres_changes', {
      event: '*', 
      schema: 'public',
      table: 'project_invitations'
    }, () => {
      debouncedInvalidateQueries(['invitations_statistics', 'recent_activities']);
    });
    
    // Event changes
    channel.on('postgres_changes', {
      event: '*', 
      schema: 'public',
      table: 'project_events'
    }, () => {
      debouncedInvalidateQueries(['dashboard_events', 'new_events_count']);
    });
    
    // Subscribe to the channel
    channel.subscribe();
    channelsRef.current.push(channel);
    
    // Initial data fetch - one-time invalidation of all queries
    debouncedInvalidateQueries([
      'projects_statistics',
      'tasks_statistics',
      'task_priorities',
      'invitations_statistics',
      'dashboard_events',
      'upcoming_tasks',
      'recent_activities',
      'new_tasks_count',
      'new_events_count'
    ]);
    
    // Cleanup function
    return () => {
      channelsRef.current.forEach(ch => {
        supabase.removeChannel(ch);
      });
      channelsRef.current = [];
    };
  }, [debouncedInvalidateQueries, queryClient]);
}
