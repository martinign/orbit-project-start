
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ProjectDetailsHeader from './project-details/ProjectDetailsHeader';
import ProjectDescription from './project-details/ProjectDescription';
import ProjectStats from './project-details/ProjectStats';
import ProjectTimeline from './project-details/ProjectTimeline';
import ProjectTabContent from './project-details/ProjectTabContent';

const ProjectDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tasks');

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

  const { data: contactsCount, refetch: refetchContacts } = useQuery({
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

  React.useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('project_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${id}`
        },
        () => {
          refetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchTasks]);

  const tasksStats = React.useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0 };
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in progress').length,
    };
  }, [tasks]);

  if (projectLoading) {
    return <div className="flex justify-center items-center h-64">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center p-8">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <ProjectDetailsHeader
        projectNumber={project.project_number}
        protocolTitle={project.protocol_title}
        sponsor={project.Sponsor}
        protocolNumber={project.protocol_number}
        status={project.status}
      />

      <ProjectDescription description={project.description} />

      <ProjectStats
        contactsCount={contactsCount || 0}
        teamMembersCount={teamMembersCount || 0}
        tasksStats={tasksStats}
      />

      <ProjectTimeline createdAt={project.created_at} />

      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="invites">Invited Members</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <ProjectTabContent
            activeTab={activeTab}
            projectId={id || ''}
            tasks={tasks || []}
            tasksLoading={tasksLoading}
            onRefetchTasks={refetchTasks}
            onRefetchContacts={refetchContacts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsView;
