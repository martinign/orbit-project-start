import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string | null;
  project_id: string;
}

type Dialog = 'edit' | 'delete' | 'update' | 'subtask' | 'create' | null;

/**
 * Manages task selection, dialog state, and deletion for a task board.
 * @param onRefetch Called after successful deletions to refresh the outer task list.
 */
export function useTaskBoard(onRefetch: () => Promise<void>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDialog, setOpenDialog] = useState<Dialog>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Open any dialog, optionally with a task and/or status
  const handleOpen = useCallback((dialog: Dialog, task?: Task, status?: string) => {
    setSelectedTask(task ?? null);
    setSelectedStatus(status ?? '');
    setOpenDialog(dialog);
  }, []);

  // Close all dialogs & clear selection
  const handleClose = useCallback(() => {
    setSelectedTask(null);
    setSelectedStatus('');
    setOpenDialog(null);
  }, []);

  // Mutation to delete a task and its related rows in cascade
  const deleteMutation = useMutation<string, Error, string>(
    async (taskId) => {
      // 1) If a Gantt entry exists, delete it first
      const { data: gantt, error: ganttErr } = await supabase
        .from('gantt_tasks')
        .select('task_id')
        .eq('task_id', taskId)
        .maybeSingle();
      if (ganttErr) throw ganttErr;
      if (gantt) {
        const { error } = await supabase
          .from('gantt_tasks')
          .delete()
          .eq('task_id', taskId);
        if (error) throw error;
      }

      // 2) Delete subtasks
      const { error: subErr } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', taskId);
      if (subErr) throw subErr;

      // 3) Delete task updates
      const { error: updErr } = await supabase
        .from('project_task_updates')
        .delete()
        .eq('task_id', taskId);
      if (updErr) throw updErr;

      // 4) Delete the main task
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);
      if (error) throw error;

      return taskId;
    },
    {
      // Optimistically remove the task from cache
      onMutate: async (taskId) => {
        await queryClient.cancelQueries(['project_tasks']);
        const previous = queryClient.getQueryData<Task[]>(['project_tasks']);
        queryClient.setQueryData<Task[]>(['project_tasks'], old =>
          old ? old.filter(t => t.id !== taskId) : []
        );
        return { previous };
      },
      onError: (error, taskId, context) => {
        // Roll back on error
        queryClient.setQueryData(['project_tasks'], context?.previous);
        toast({
          title: 'Error',
          description: 'Failed to delete task. Please try again.',
          variant: 'destructive',
        });
      },
      onSuccess: async () => {
        // Invalidate & re-fetch
        await queryClient.invalidateQueries(['project_tasks']);
        await onRefetch();
        handleClose();
        toast({
          title: 'Task Deleted',
          description: 'The task and all related data have been removed.',
        });
      },
    }
  );

  // Public API
  return {
    // state
    selectedTask,
    openDialog,
    selectedStatus,
    isDeleting: deleteMutation.isLoading,

    // dialog controls
    editTask: (task: Task) => handleOpen('edit', task),
    confirmDelete: (task: Task) => handleOpen('delete', task),
    updateTask: (task: Task) => handleOpen('update', task),
    addSubtask: (task: Task) => handleOpen('subtask', task),
    createTask: (status: string) => handleOpen('create', undefined, status),
    closeAllDialogs: handleClose,

    // actions
    deleteTask: () => {
      if (selectedTask) deleteMutation.mutate(selectedTask.id);
    },
  };
}
