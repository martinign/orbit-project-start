
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProjectDetails = (projectId: string | undefined) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tasks');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
        throw error;
      }
      return data;
    },
    enabled: !!projectId,
  });

  const { data: contactsCount } = useQuery({
    queryKey: ['project_contacts_count', projectId],
    queryFn: async () => {
      if (!projectId) return 0;
      const { count, error } = await supabase
        .from('project_contacts')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!projectId,
  });

  const { data: teamMembersCount } = useQuery({
    queryKey: ['project_team_members_count', projectId],
    queryFn: async () => {
      if (!projectId) return 0;
      const { count, error } = await supabase
        .from('project_team_members')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!projectId,
  });

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: eventsCount } = useQuery({
    queryKey: ['project_events_count', projectId],
    queryFn: async () => {
      if (!projectId) return 0;
      const { count, error } = await supabase
        .from('project_events')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!projectId,
  });

  const { data: notesCount } = useQuery({
    queryKey: ['project_notes_count', projectId],
    queryFn: async () => {
      if (!projectId) return 0;
      const { count, error } = await supabase
        .from('project_notes')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (error) throw error;
      console.log('Notes count from query:', count);
      return count || 0;
    },
    enabled: !!projectId,
  });

  const tasksStats = (() => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0 };
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in progress').length;
    return { total, completed, inProgress };
  })();

  const handleRefetch = useCallback(async () => {
    try {
      await refetchTasks();
    } catch (error) {
      console.error('Error refetching tasks:', error);
    }
  }, [refetchTasks]);

  return {
    project,
    projectLoading,
    contactsCount: contactsCount || 0,
    teamMembersCount: teamMembersCount || 0,
    tasks: tasks || [],
    tasksLoading,
    refetchTasks: handleRefetch,
    eventsCount: eventsCount || 0,
    notesCount: notesCount || 0,
    tasksStats,
    activeTab,
    setActiveTab,
    contactSearchQuery,
    setContactSearchQuery
  };
};
