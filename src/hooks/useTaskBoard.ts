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

export function useTaskBoard(onRefetch: () => Promise<void>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDialog, setOpenDialog] = useState<Dialog>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Open any of the modals
  const handleOpen = useCallback(
    (dialog: Dialog, task?: Task, status?: string) => {
      setSelectedTask(task ?? null);
      setSelectedStatus(status ?? '');
      setOpenDialog(dialog);
    },
    []
  );

  // Close all modals & clear selection
  const handleClose = useCallback(() => {
    setSelectedTask(null);
    setSelectedStatus('');
    setOpenDialog(null);
  }, []);

  // Delete mutation (single-object API)
  const deleteMutation = useMutation({
    // 1) mutationFn deletes gantt_tasks, subtasks, updates, then the task itself
    mutationFn: async (taskId: string) => {
      // remove any Gantt row first
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

      // remove subtasks
      const { error: subErr } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', taskId);
      if (subErr) throw subErr;

      // remove task updates
      const { error: updErr } = await supabase
        .from('project_task_updates')
        .delete()
        .eq('task_id', taskId);
      if (updErr) throw updErr;

      // finally remove the task
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);
      if (error) throw error;

      return taskId;
    },

    // 2) optimistic update: remove from cache immediately
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries(['project_tasks']);
      const previous = queryClient.getQueryData<Task[]>(['project_tasks']);
      queryClient.setQueryData<Task[]>(['project_tasks'], old =>
        old ? old.filter(t => t.id !== taskId) : []
      );
      return { previous };
    },

    // 3) rollback on error
    onError: (err, taskId, context) => {
      queryClient.setQueryData(['project_tasks'], context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    },

    // 4) on success: re-fetch & close dialogs
    onSuccess: async () => {
      await queryClient.invalidateQueries(['project_tasks']);
      await onRefetch();
      handleClose();
      toast({
        title: 'Task Deleted',
        description: 'The task and all related data have been removed.',
      });
    },
  });

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

    // action: kicks off the mutation
    deleteTask: () => {
      if (selectedTask) {
        deleteMutation.mutate(selectedTask.id);
      }
    },
  };
}
