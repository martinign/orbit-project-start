
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
}

export const useTaskBoard = (onRefetch: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

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

  const handleAddSubtask = (task: Task) => {
    setSelectedTask(task);
    setIsSubtaskDialogOpen(true);
  };

  const handleCreateTask = (status: string) => {
    setSelectedStatus(status);
    setIsCreateTaskDialogOpen(true);
  };

  const deleteTask = async () => {
    if (!selectedTask) return;

    try {
      const { error: subtasksError } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', selectedTask.id);

      if (subtasksError) throw subtasksError;

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
      onRefetch();
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
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isSubtaskDialogOpen,
    isCreateTaskDialogOpen,
    selectedStatus,
    setIsDialogOpen,
    setIsDeleteConfirmOpen,
    setIsUpdateDialogOpen,
    setIsSubtaskDialogOpen,
    setIsCreateTaskDialogOpen,
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
    handleAddSubtask,
    handleCreateTask,
    deleteTask,
  };
};
