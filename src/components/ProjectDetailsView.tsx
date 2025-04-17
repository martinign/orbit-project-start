
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  ListTodo,
  Users,
  UserRound,
} from 'lucide-react';
import TasksList from './TasksList';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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

  // Fetch project contacts count
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

  // Fetch project team members count
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

  // Fetch tasks statistics
  const { data: tasksStats } = useQuery({
    queryKey: ['project_tasks_stats', id],
    queryFn: async () => {
      if (!id) return { total: 0, completed: 0, inProgress: 0 };
      
      const { data: tasks, error } = await supabase
        .from('project_tasks')
        .select('status')
        .eq('project_id', id);
        
      if (error) throw error;
      
      const total = tasks.length;
      const completed = tasks.filter(t => t.status.toLowerCase() === 'completed').length;
      const inProgress = tasks.filter(t => t.status.toLowerCase() === 'in progress').length;
      
      return { total, completed, inProgress };
    },
    enabled: !!id,
  });

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/projects">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {project.project_number}: {project.protocol_title}
            </h1>
            <p className="text-muted-foreground">
              Sponsor: {project.Sponsor} • Protocol: {project.protocol_number}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.status === 'active'
                ? 'bg-green-100 text-green-800'
                : project.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : project.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {project.description && (
        <Card>
          <CardContent className="pt-6">
            <p>{project.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">{contactsCount}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{teamMembersCount}</p>
              </div>
              <UserRound className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks</p>
                <p className="text-2xl font-bold">{tasksStats?.total || 0}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-green-600">
                    {tasksStats?.completed || 0} Completed
                  </span>
                  <span className="text-blue-600">
                    {tasksStats?.inProgress || 0} In Progress
                  </span>
                </div>
              </div>
              <ListTodo className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Project created on {formatDate(project.created_at)}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>Manage tasks for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <TasksList projectId={id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Contacts</CardTitle>
              <CardDescription>View and manage project contacts</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Contact list component would go here */}
              <p className="text-muted-foreground">Project contacts will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>View and manage project team members</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Team members list component would go here */}
              <p className="text-muted-foreground">Project team members will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsView;
