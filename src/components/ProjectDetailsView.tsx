
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ProjectHeader from './project-details/ProjectHeader';
import ProjectStats from './project-details/ProjectStats';
import ProjectTabs from './project-details/ProjectTabs';

const ProjectDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Fetch project details
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

  // Fetch statistics
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

  const { data: tasks } = useQuery({
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
      <ProjectHeader
        projectNumber={project.project_number}
        protocolTitle={project.protocol_title}
        sponsor={project.Sponsor}
        protocolNumber={project.protocol_number}
        status={project.status}
      />

      {project.description && (
        <Card>
          <CardContent className="pt-6">
            <p>{project.description}</p>
          </CardContent>
        </Card>
      )}

      <ProjectStats
        contactsCount={contactsCount || 0}
        teamMembersCount={teamMembersCount || 0}
        tasksStats={tasksStats}
      />

      <ProjectTabs 
        projectId={id || ''} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default ProjectDetailsView;
