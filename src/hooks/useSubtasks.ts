import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string | null;
  parent_task_id: string;
  notes?: string | null;
  assigned_to?: string | null;
}

export function useSubtasks(taskId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['project_subtasks', taskId];

  // 1) Fetch subtasks list
  const {
    data: subtasks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Subtask[], Error>({
    queryKey,
    enabled: !!taskId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Subtask>('project_subtasks')
        .select('*')
        .eq('parent_task_id', taskId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 2) Realtime subscription to keep list fresh
  useEffect(() => {
    if (!taskId) return;
    const channel = supabase
      .channel(`project_subtasks_${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_subtasks',
          filter: `parent_task_id=eq.${taskId}`,
        },
        () => {
          queryClient.invalidateQueries(queryKey);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, queryClient]);

  // 3) Delete mutation with optimistic update
  const deleteMutation = useMutation<string, Error, string>({
    mutationFn: async (subtaskId) => {
      const { error } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('id', subtaskId);
      if (error) throw error;
      return subtaskId;
    },
    onMutate: async (subtaskId) => {
      await queryClient.cancelQueries(queryKey);
      const previous = queryClient.getQueryData<Subtask[]>(queryKey);
      queryClient.setQueryData<Subtask[]>(queryKey, old =>
        old ? old.filter(s => s.id !== subtaskId) : []
      );
      return { previous };
    },
    onError: (err, subtaskId, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({
        title: 'Error',
        description: 'Failed to delete subtask. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Subtask deleted successfully.',
      });
      queryClient.invalidateQueries(queryKey);
    },
  });

  return {
    subtasks,
    isLoading,
    isError,
    refetch,
    deleteSubtask: deleteMutation.mutateAsync,
  };
}
