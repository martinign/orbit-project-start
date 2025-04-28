
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  parent_task_id: string;
  notes?: string;
  assigned_to?: string;
}

export const useSubtasks = (taskId: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add real-time subscription for subtasks
  useRealtimeSubscription({
    table: 'project_subtasks',
    filter: 'parent_task_id',
    filterValue: taskId,
    onRecordChange: () => {
      fetchSubtasks();
    }
  });

  const fetchSubtasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_subtasks')
        .select('*')
        .eq('parent_task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subtask deleted successfully",
      });
      
      fetchSubtasks();
    } catch (error) {
      console.error('Error deleting subtask:', error);
      toast({
        title: "Error",
        description: "Failed to delete subtask. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchSubtasks();
    }
  }, [taskId]);

  return {
    subtasks,
    isLoading,
    fetchSubtasks,
    deleteSubtask
  };
};
