
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTaskUpdates = (taskId: string) => {
  const [updateCount, setUpdateCount] = useState(0);

  const fetchUpdateCount = async () => {
    try {
      const { count, error } = await supabase
        .from('project_task_updates')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId);

      if (error) throw error;
      setUpdateCount(count || 0);
    } catch (error) {
      console.error('Error fetching update count:', error);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchUpdateCount();
      
      const channel = supabase
        .channel('task-updates')
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
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [taskId]);

  return {
    updateCount,
    fetchUpdateCount
  };
};
