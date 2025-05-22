
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useArchivedTasks = (projectId: string) => {
  const { data: archivedTasks, isLoading, refetch } = useQuery({
    queryKey: ['archived_tasks', projectId],
    queryFn: async () => {
      // Fetch tasks that are marked as archived and join with task_status_history to get completion data
      const { data: tasks, error } = await supabase
        .from('project_tasks')
        .select(`
          id, 
          title, 
          status, 
          project_id, 
          task_status_history (
            completion_date, 
            total_duration_days
          )
        `)
        .eq('project_id', projectId)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to include completion date and duration
      return tasks.map(task => {
        // Get the most recent status history entry (for completed status)
        const latestStatusChange = task.task_status_history?.[0];
        
        return {
          ...task,
          completion_date: latestStatusChange?.completion_date,
          total_duration_days: latestStatusChange?.total_duration_days
        };
      });
    },
  });

  return {
    archivedTasks: archivedTasks || [],
    isLoading,
    refetchArchivedTasks: refetch
  };
};
