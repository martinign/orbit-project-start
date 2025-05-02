
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubtaskWithMeta {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  parent_task_id: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

export interface TaskWithSubtasks {
  taskId: string;
  subtasks: SubtaskWithMeta[];
}

export const useSubtasksTimeline = (tasks: any[]) => {
  const [taskWithSubtasks, setTaskWithSubtasks] = useState<Record<string, SubtaskWithMeta[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch all subtasks for all tasks
  const fetchAllSubtasks = async () => {
    if (!tasks.length) return;
    
    const taskIds = tasks.map(task => task.id);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('project_subtasks')
        .select('*')
        .in('parent_task_id', taskIds)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Group subtasks by parent task
      const subtasksByTask: Record<string, SubtaskWithMeta[]> = {};
      data?.forEach(subtask => {
        if (!subtasksByTask[subtask.parent_task_id]) {
          subtasksByTask[subtask.parent_task_id] = [];
        }
        subtasksByTask[subtask.parent_task_id].push(subtask as SubtaskWithMeta);
      });
      
      setTaskWithSubtasks(subtasksByTask);
    } catch (error) {
      console.error('Error fetching subtasks for timeline:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subtasks for timeline view',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle expanded state of a task
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Check if a task has subtasks
  const hasSubtasks = (taskId: string): boolean => {
    return !!taskWithSubtasks[taskId]?.length;
  };
  
  // Get subtasks for a specific task
  const getSubtasksForTask = (taskId: string): SubtaskWithMeta[] => {
    return taskWithSubtasks[taskId] || [];
  };
  
  // Check if a task is expanded
  const isTaskExpanded = (taskId: string): boolean => {
    return !!expandedTasks[taskId];
  };
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!tasks.length) return;
    
    const taskIds = tasks.map(task => task.id);
    
    fetchAllSubtasks();
    
    const channel = supabase
      .channel('subtasks_timeline')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_subtasks',
        filter: `parent_task_id=in.(${taskIds.join(',')})`
      }, () => {
        fetchAllSubtasks();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tasks]);
  
  return {
    taskWithSubtasks,
    expandedTasks,
    isLoading,
    toggleTaskExpanded,
    hasSubtasks,
    getSubtasksForTask,
    isTaskExpanded
  };
};
