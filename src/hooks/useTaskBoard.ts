
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
  const [isUpdatesDisplayOpen, setIsUpdatesDisplayOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCloseDialogs = () => {
    if (isDeleting || isRefetching) return; // Don't close dialogs during async operations
    
    setSelectedTask(null);
    setIsDialogOpen(false);
    setIsDeleteConfirmOpen(false);
    setIsUpdateDialogOpen(false);
    setIsUpdatesDisplayOpen(false);
    setIsSubtaskDialogOpen(false);
    setIsCreateTaskDialogOpen(false);
  };

  const safeRefetch = async () => {
    if (!isRefetching) {
      setIsRefetching(true);
      try {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        await onRefetch();
      } catch (error) {
        console.error("Error refetching tasks:", error);
        toast({
          title: "Refresh Failed",
          description: "Unable to refresh task data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsRefetching(false);
      }
    }
  };

  const handleEditTask = (task: Task) => {
    console.log("Opening edit dialog with task:", task);
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
    // Close updates display if it was open
    setIsUpdatesDisplayOpen(false);
  };

  const handleShowUpdates = (task: Task) => {
    setSelectedTask(task);
    setIsUpdatesDisplayOpen(true);
    // Close update dialog if it was open
    setIsUpdateDialogOpen(false);
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

    setIsDeleting(true);
    
    try {
      // Check if this is a Gantt task
      const { data: ganttTask } = await supabase
        .from('gantt_tasks')
        .select('task_id')
        .eq('task_id', selectedTask.id)
        .maybeSingle();
      
      if (ganttTask) {
        // Delete from gantt_tasks first (due to foreign key constraint)
        const { error: ganttError } = await supabase
          .from('gantt_tasks')
          .delete()
          .eq('task_id', selectedTask.id);
          
        if (ganttError) throw ganttError;
      }

      // Delete any subtasks
      const { error: subtasksError } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', selectedTask.id);

      if (subtasksError) throw subtasksError;

      // Delete task updates
      const { error: updatesError } = await supabase
        .from('project_task_updates')
        .delete()
        .eq('task_id', selectedTask.id);
        
      if (updatesError) throw updatesError;

      // Delete the main task
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: 'Task Deleted',
        description: 'The task and its related data have been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setSelectedTask(null);
      
      // After a short delay to allow state updates, trigger a refetch
      setTimeout(() => {
        safeRefetch();
      }, 300);
    }
  };

  return {
    selectedTask,
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isUpdatesDisplayOpen,
    isSubtaskDialogOpen,
    isCreateTaskDialogOpen,
    selectedStatus,
    isDeleting,
    isRefetching,
    setIsDialogOpen,
    setIsDeleteConfirmOpen,
    setIsUpdateDialogOpen,
    setIsUpdatesDisplayOpen,
    setIsSubtaskDialogOpen,
    setIsCreateTaskDialogOpen,
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
    handleShowUpdates,
    handleAddSubtask,
    handleCreateTask,
    deleteTask,
    handleCloseDialogs,
  };
};
