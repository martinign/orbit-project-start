
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  projects?: {
    id: string;
    project_number: string;
    Sponsor: string;
  };
}

export const useTaskManagement = (projectId?: string, searchTerm: string = '') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [isUpdatesDisplayOpen, setIsUpdatesDisplayOpen] = useState(false); // Add separate state for displaying updates

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteConfirmOpen(true);
  };

  const handleTaskUpdates = (task: Task) => {
    setSelectedTask(task);
    setIsUpdateDialogOpen(true);
  };

  const handleShowTaskUpdates = (task: Task) => {
    setSelectedTask(task);
    setIsUpdatesDisplayOpen(true);
  };

  const handleAddSubtask = (task: Task) => {
    setSelectedTask(task);
    setIsSubtaskDialogOpen(true);
  };

  const deleteTask = async () => {
    if (!selectedTask) return;

    try {
      // Check if task has subtasks and delete them
      const { error: subtasksError } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', selectedTask.id);

      if (subtasksError) throw subtasksError;

      // Delete any task updates
      const { error: updatesError } = await supabase
        .from('project_task_updates')
        .delete()
        .eq('task_id', selectedTask.id);
        
      if (updatesError) throw updatesError;

      // Delete the task
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Deleted',
        description: 'The task and its subtasks have been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  return {
    selectedTask,
    setSelectedTask, // Expose this function
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isSubtaskDialogOpen,
    isUpdatesDisplayOpen, // Add the new state
    setIsDialogOpen,
    setIsDeleteConfirmOpen,
    setIsUpdateDialogOpen,
    setIsSubtaskDialogOpen,
    setIsUpdatesDisplayOpen, // Add the new setter
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
    handleShowTaskUpdates, // Add the new handler
    handleAddSubtask,
    deleteTask,
  };
};
