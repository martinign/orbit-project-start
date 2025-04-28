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

type Dialog = 'edit' | 'delete' | 'update' | 'subtask' | 'create' | null;

export function useTaskBoard(
  projectId: string,
  onRefetch: () => Promise<void>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['project_tasks', projectId];

  // Internal single-dialog state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openDialog, setOpenDialog] = useState<Dialog>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Computed booleans for each dialog
  const isDialogOpen            = openDialog === 'edit';
  const isDeleteConfirmOpen     = openDialog === 'delete';
  const isUpdateDialogOpen      = openDialog === 'update';
  const isSubtaskDialogOpen     = openDialog === 'subtask';
  const isCreateTaskDialogOpen  = openDialog === 'create';

  const handleOpen = useCallback(
    (dialog: Dialog, task?: Task, status?: string) => {
      setSelectedTask(task ?? null);
      setSelectedStatus(status ?? '');
      setOpenDialog(dialog);
    },
    []
  );

  const handleCloseDialogs = useCallback(() => {
    setSelectedTask(null);
    setSelectedStatus('');
    setOpenDialog(null);
  }, []);

  const safeRefetch = useCallback(async () => {
    try {
      await onRefetch();
      await queryClient.invalidateQueries(queryKey);
    } catch (err) {
      console.error('Error refetching tasks:', err);
    }
  }, [onRefetch, queryClient, queryKey]);

  const deleteTask = useCallback(async () => {
    if (!selectedTask) return;

    try {
      // 1) Cascade delete gantt_tasks if present
      const { data: gantt, error: ganttErr } = await supabase
        .from('gantt_tasks')
        .select('task_id')
        .eq('task_id', selectedTask.id)
        .maybeSingle();
      if (ganttErr) throw ganttErr;
      if (gantt) {
        const { error } = await supabase
          .from('gantt_tasks')
          .delete()
          .eq('task_id', selectedTask.id);
        if (error) throw error;
      }

      // 2) Delete subtasks
      const { error: subErr } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', selectedTask.id);
      if (subErr) throw subErr;

      // 3) Delete task updates
      const { error: updErr } = await supabase
        .from('project_task_updates')
        .delete()
        .eq('task_id', selectedTask.id);
      if (updErr) throw updErr;

      // 4) Delete main task
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', selectedTask.id);
      if (error) throw error;

      // then refresh + close + toast
      await safeRefetch();
      handleCloseDialogs();
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
  }, [selectedTask, safeRefetch, handleCloseDialogs, toast]);

  // realtime subscription scoped to this project
  useRealtimeSubscription({
    table: 'project_tasks',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      queryClient.invalidateQueries(queryKey);
    }
  });

  return {
    // selection + dialog flags
    selectedTask,
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isSubtaskDialogOpen,
    isCreateTaskDialogOpen,
    selectedStatus,

    // dialog setters (if you still need them directly)
    setIsDialogOpen:          (v: boolean) => setOpenDialog(v ? 'edit' : null),
    setIsDeleteConfirmOpen:   (v: boolean) => setOpenDialog(v ? 'delete' : null),
    setIsUpdateDialogOpen:    (v: boolean) => setOpenDialog(v ? 'update' : null),
    setIsSubtaskDialogOpen:   (v: boolean) => setOpenDialog(v ? 'subtask' : null),
    setIsCreateTaskDialogOpen:(v: boolean) => setOpenDialog(v ? 'create' : null),

    // handlers
    handleEditTask:    (task: Task) => handleOpen('edit', task),
    handleDeleteConfirm:(task: Task)=> handleOpen('delete', task),
    handleTaskUpdates: (task: Task) => handleOpen('update', task),
    handleAddSubtask:  (task: Task) => handleOpen('subtask', task),
    handleCreateTask:  (status: string) => handleOpen('create', undefined, status),
    handleCloseDialogs,

    // actions
    deleteTask,
    safeRefetch,
  };
}
