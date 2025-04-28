import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
}

type Dialog = 
  | 'edit'
  | 'delete'
  | 'update'
  | 'subtask'
  | 'create'
  | null;

/**
 * Manages selection, dialogs, delete + real-time for your task board.
 * @param projectId  The project to scope subscriptions & invalidations to.
 * @param onRefetch  A callback you already use to re-fetch your tasks list.
 */
export function useTaskBoard(
  projectId: string,
  onRefetch: () => Promise<void>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['project_tasks', projectId];

  // --- Dialog + selection state ---
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDialog, setOpenDialog] = useState<Dialog>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handleOpen = useCallback(
    (dialog: Dialog, task?: Task, status?: string) => {
      setSelectedTask(task ?? null);
      setSelectedStatus(status ?? '');
      setOpenDialog(dialog);
    },
    []
  );

  const handleClose = useCallback(() => {
    setSelectedTask(null);
    setSelectedStatus('');
    setOpenDialog(null);
  }, []);

  // --- Safe refetch + invalidate ---
  const safeRefetch = useCallback(async () => {
    try {
      await onRefetch();
      await queryClient.invalidateQueries(queryKey);
    } catch (err) {
      console.error('Error re-fetching tasks:', err);
    }
  }, [onRefetch, queryClient, queryKey]);

  // --- Delete logic (unchanged) ---
  const deleteTask = useCallback(async () => {
    if (!selectedTask) return;

    try {
      // (1) Cascade delete in gantt_tasks if exists
      const { data: ganttTask, error: ganttError } = await supabase
        .from('gantt_tasks')
        .select('task_id')
        .eq('task_id', selectedTask.id)
        .maybeSingle();
      if (ganttError) throw ganttError;
      if (ganttTask) {
        const { error } = await supabase
          .from('gantt_tasks')
          .delete()
          .eq('task_id', selectedTask.id);
        if (error) throw error;
      }

      // (2) Delete subtasks
      const { error: subtasksError } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', selectedTask.id);
      if (subtasksError) throw subtasksError;

      // (3) Delete task updates
      const { error: updatesError } = await supabase
        .from('project_task_updates')
        .delete()
        .eq('task_id', selectedTask.id);
      if (updatesError) throw updatesError;

      // (4) Delete the main task
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', selectedTask.id);
      if (error) throw error;

      // Refresh + close dialogs + notify
      await safeRefetch();
      handleClose();

      toast({
        title: 'Task Deleted',
        description: 'The task and its related data were deleted.',
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the task. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedTask, safeRefetch, toast, handleClose]);

  // --- Realtime subscription to keep the board in sync ---
  useRealtimeSubscription({
    table: 'project_tasks',            // match your table name
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  // --- Public API ---
  return {
    // state
    selectedTask,
    openDialog,
    selectedStatus,

    // flags
    isDeleting: false,      // you could wire this up if needed

    // dialog controls
    editTask:    (task: Task) => handleOpen('edit', task),
    confirmDelete:(task: Task)=> handleOpen('delete', task),
    updateTask:  (task: Task) => handleOpen('update', task),
    addSubtask:  (task: Task) => handleOpen('subtask', task),
    createTask:  (status: string) => handleOpen('create', undefined, status),
    closeAllDialogs: handleClose,

    // actions
    deleteTask,
    safeRefetch,
  };
}
