
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface TaskUpdate {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const useTaskUpdates = (taskId: string) => {
  const [updateCount, setUpdateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const fetchUpdateCount = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    try {
      const { count, error } = await supabase
        .from('project_task_updates')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId);

      if (error) throw error;
      setUpdateCount(count || 0);
    } catch (error) {
      console.error('Error fetching update count:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to mark updates as viewed (placeholder for future functionality)
  const markUpdatesAsViewed = async () => {
    try {
      // In a future enhancement, this would update a 'viewed' flag in the database
      // For now, we'll just refetch to ensure the count is current
      await fetchUpdateCount();
      // Invalidate any project-level queries that might be caching update counts
      queryClient.invalidateQueries({ queryKey: ['task-updates', taskId] });
    } catch (error) {
      console.error('Error marking updates as viewed:', error);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchUpdateCount();
      
      const channel = supabase
        .channel(`task-updates-${taskId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'project_task_updates',
            filter: `task_id=eq.${taskId}`
          },
          () => {
            fetchUpdateCount();
            // Also invalidate any project-level queries
            queryClient.invalidateQueries({ queryKey: ['task-updates', taskId] });
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [taskId, queryClient]);

  return {
    updateCount,
    isLoading,
    fetchUpdateCount,
    markUpdatesAsViewed
  };
};
