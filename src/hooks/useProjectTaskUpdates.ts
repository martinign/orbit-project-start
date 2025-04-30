
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface UpdateCounts {
  [taskId: string]: number;
}

export const useProjectTaskUpdates = (projectId: string) => {
  const [updateCounts, setUpdateCounts] = useState<UpdateCounts>({});
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch update counts for all tasks in a project
  const fetchAllUpdateCounts = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      // First get all tasks for this project
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('id')
        .eq('project_id', projectId);
      
      if (tasksError) throw tasksError;
      
      // For each task, get the update count
      if (tasks && tasks.length > 0) {
        const counts: UpdateCounts = {};
        
        // Use Promise.all to fetch all counts in parallel
        await Promise.all(tasks.map(async (task) => {
          const { count, error } = await supabase
            .from('project_task_updates')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', task.id);
            
          if (error) throw error;
          if (count && count > 0) {
            counts[task.id] = count;
          }
        }));
        
        setUpdateCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching project update counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  // Get update count for a specific task
  const getUpdateCountForTask = (taskId: string): number => {
    return updateCounts[taskId] || 0;
  };
  
  // Function to mark updates as viewed for a specific task
  const markTaskUpdatesAsViewed = async (taskId: string) => {
    try {
      // In a future enhancement, this would update a 'viewed' flag in the database
      // For now, we'll just update our local state
      setUpdateCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[taskId];
        return newCounts;
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['task-updates'] });
    } catch (error) {
      console.error('Error marking updates as viewed:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchAllUpdateCounts();
      
      // Set up real-time subscription for all task updates in this project
      const channel = supabase
        .channel(`project-all-task-updates-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'project_task_updates'
          },
          (payload) => {
            // @ts-ignore - payload.new exists
            const newUpdate = payload.new as { task_id: string };
            
            // Update the count for this specific task
            setUpdateCounts(prev => ({
              ...prev,
              [newUpdate.task_id]: (prev[newUpdate.task_id] || 0) + 1
            }));
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId, fetchAllUpdateCounts]);

  return {
    updateCounts,
    isLoading,
    getUpdateCountForTask,
    markTaskUpdatesAsViewed,
    fetchAllUpdateCounts
  };
};
