import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Plus,
  Search,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import TaskBoard from './TaskBoard';
import TaskDialog from './TaskDialog';
import { Input } from '@/components/ui/input';
import ContactsList from './ContactsList';
import TeamMembersList from './TeamMembersList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ContactForm from './ContactForm';

const ProjectDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tasks');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);

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

  // Fetch project tasks
  const { 
    data: tasks, 
    isLoading: tasksLoading, 
    refetch: refetchTasks 
  } = useQuery({
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

  // Set up real-time subscription for tasks updates
  useEffect(() => {
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

  // Calculate task statistics
  const tasksStats = React.useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0, notStarted: 0, pending: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in progress').length;
    const notStarted = tasks.filter(t => t.status === 'not started').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    return { total, completed, inProgress, notStarted, pending };
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
                <p className="text-2xl font-bold">{tasksStats.total}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-green-600">
                    {tasksStats.completed} Completed
                  </span>
                  <span className="text-blue-600">
                    {tasksStats.inProgress} In Progress
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>Manage tasks for this project</CardDescription>
              </div>
              <div>
                <Button 
                  onClick={() => setIsTaskDialogOpen(true)} 
                  className="bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="text-center py-6">Loading tasks...</div>
              ) : tasks && tasks.length > 0 ? (
                <TaskBoard 
                  tasks={tasks} 
                  projectId={id || ''} 
                  onRefetch={refetchTasks} 
                />
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No tasks found for this project</p>
                  <Button 
                    onClick={() => setIsTaskDialogOpen(true)} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <TaskDialog
            open={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen(false)}
            mode="create"
            projectId={id}
            onSuccess={() => {
              refetchTasks();
              setIsTaskDialogOpen(false);
            }}
          />
        </TabsContent>
        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project Contacts</CardTitle>
                <CardDescription>View and manage project contacts</CardDescription>
              </div>
              <div>
                <Button 
                  onClick={() => setIsCreateContactOpen(true)} 
                  className="bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search contacts..."
                    className="pl-8"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                  />
                  {contactSearchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setContactSearchQuery('')}
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <ContactsList 
                projectId={id} 
                searchQuery={contactSearchQuery} 
                viewMode="table" 
              />
            </CardContent>
          </Card>
          
          <Dialog open={isCreateContactOpen} onOpenChange={setIsCreateContactOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to this project
                </DialogDescription>
              </DialogHeader>
              <ContactForm 
                projectId={id}
                onSuccess={() => {
                  setIsCreateContactOpen(false);
                  refetchContacts();
                  toast({
                    title: "Success",
                    description: "Contact added successfully",
                  });
                }} 
              />
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>View and manage project team members</CardDescription>
              </div>
              <div>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Team Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TeamMembersList 
                projectId={id} 
                searchQuery="" 
                viewMode="table" 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsView;
