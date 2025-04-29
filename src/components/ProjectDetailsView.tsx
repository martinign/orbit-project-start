
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectHeader } from './project-details/ProjectHeader';
import { ProjectStatisticsCards } from './project-details/ProjectStatisticsCards';
import { ProjectContentTabs } from './project-details/ProjectContentTabs';
import { ProjectTabsContent } from './project-details/ProjectTabsContent';

const ProjectDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tasks');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
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
    enabled: !!id,
  });

  const { data: contactsCount } = useQuery({
    queryKey: ['project_contacts_count', id],
    queryFn: async () => {
      if (!id) return 0;
      const { count, error } = await supabase
        .from('project_contacts')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  const { data: teamMembersCount } = useQuery({
    queryKey: ['project_team_members_count', id],
    queryFn: async () => {
      if (!id) return 0;
      const { count, error } = await supabase
        .from('project_team_members')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: eventsCount } = useQuery({
    queryKey: ['project_events_count', id],
    queryFn: async () => {
      if (!id) return 0;
      const { count, error } = await supabase
        .from('project_events')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  const { data: notesCount } = useQuery({
    queryKey: ['project_notes_count', id],
    queryFn: async () => {
      if (!id) return 0;
      const { count, error } = await supabase
        .from('project_notes')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  // Add real-time subscriptions to update counts
  React.useEffect(() => {
    if (!id) return;

    // Set up real-time subscription for notes count
    const notesChannel = supabase.channel(`notes_count_${id}`)
      .on('postgres_changes',
        {
          event: '*',  // Changed from 'INSERT' to '*' to listen for all events
          schema: 'public',
          table: 'project_notes',
          filter: `project_id=eq.${id}`
        },
        () => {
          // Invalidate the query to update the notes count
          queryClient.invalidateQueries({ queryKey: ['project_notes_count', id] });
        }
      )
      .subscribe();

    // Set up real-time subscription for events count
    const eventsChannel = supabase.channel(`events_count_${id}`)
      .on('postgres_changes',
        {
          event: '*',  // Changed from 'INSERT' to '*' to listen for all events
          schema: 'public',
          table: 'project_events',
          filter: `project_id=eq.${id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['project_events_count', id] });
        }
      )
      .subscribe();

    // Set up real-time subscription for tasks count
    const tasksChannel = supabase.channel(`tasks_count_${id}`)
      .on('postgres_changes',
        {
          event: '*',  // Changed from 'INSERT' to '*' to listen for all events
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', id] });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [id, queryClient]);

  const tasksStats = React.useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0 };
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in progress').length;
    return { total, completed, inProgress };
  }, [tasks]);

  if (projectLoading) {
    return <div className="flex justify-center items-center h-64">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center p-8">Project not found</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <ProjectHeader
        projectNumber={project.project_number}
        protocolTitle={project.protocol_title}
        sponsor={project.Sponsor}
        protocolNumber={project.protocol_number}
        status={project.status}
        projectType={project.project_type}
      />

      {project.description && (
        <Card>
          <CardContent className="pt-6">
            <p>{project.description}</p>
          </CardContent>
        </Card>
      )}

      <ProjectStatisticsCards
        contactsCount={contactsCount || 0}
        teamMembersCount={teamMembersCount || 0}
        tasksStats={tasksStats}
        eventsCount={eventsCount || 0}
        notesCount={notesCount || 0}
        onTabChange={setActiveTab}
        projectId={id || ''}
      />

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Project created on {formatDate(project.created_at)}</CardDescription>
        </CardHeader>
      </Card>

      <ProjectContentTabs activeTab={activeTab} onTabChange={setActiveTab}>
        <ProjectTabsContent
          activeTab={activeTab}
          projectId={id || ''}
          tasks={tasks || []}
          tasksLoading={tasksLoading}
          refetchTasks={refetchTasks}
          contactSearchQuery={contactSearchQuery}
          setContactSearchQuery={setContactSearchQuery}
        />
      </ProjectContentTabs>
    </div>
  );
};

export default ProjectDetailsView;
