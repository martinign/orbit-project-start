import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';
import { useProjectInvitations } from '@/hooks/useProjectInvitations';

import { Button } from '@/components/ui/button';
import {
  Calendar,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
  Users,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import TaskDialog from './TaskDialog';

interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  project_id: string;
  projects?: Project;
  created_at: string;
}

interface TasksListProps {
  projectId?: string;
  searchTerm?: string;
}

const TasksList: React.FC<TasksListProps> = ({ projectId, searchTerm = '' }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project_team_members_and_invitations', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data: invitations, error: invitationsError } = await supabase
        .from('project_invitations')
        .select('inviter_id, invitee_id, status')
        .eq('project_id', projectId);

      if (invitationsError) throw invitationsError;

      const userIds = new Set([
        ...invitations.map(inv => inv.inviter_id),
        ...invitations.map(inv => inv.invitee_id)
      ]);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, last_name')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      return profiles;
    },
    enabled: !!projectId
  });

  const { data: projectInvitations = [], isLoading: invitationsLoading } = useProjectInvitations(projectId || null);

  const uniqueUsers = React.useMemo(() => {
    const userMap = new Map();
    
    projectInvitations.forEach((invitation) => {
      if (invitation.inviter?.id && invitation.inviter?.full_name && invitation.inviter?.last_name) {
        userMap.set(invitation.inviter.id, {
          id: invitation.inviter.id,
          full_name: `${invitation.inviter.full_name} ${invitation.inviter.last_name}`,
          role: 'Inviter'
        });
      }
      if (invitation.invitee?.id && invitation.invitee?.full_name && invitation.invitee?.last_name && invitation.status === 'accepted') {
        userMap.set(invitation.invitee.id, {
          id: invitation.invitee.id,
          full_name: `${invitation.invitee.full_name} ${invitation.invitee.last_name}`,
          role: 'Invitee'
        });
      }
    });

    return Array.from(userMap.values());
  }, [projectInvitations]);

  useRealtimeSubscription({
    table: 'project_tasks',
    filter: projectId ? 'project_id' : undefined,
    filterValue: projectId || undefined,
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', projectId, searchTerm, selectedMemberId],
    queryFn: async () => {
      let query = supabase
        .from('project_tasks')
        .select('*, projects:project_id(id, project_number, Sponsor)');

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedMemberId) {
        query = query.eq('user_id', selectedMemberId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const handleCreateTask = () => {
    setDialogMode('create');
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setDialogMode('edit');
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteConfirmOpen(true);
  };

  const deleteTask = async () => {
    if (!selectedTask) return;

    queryClient.setQueryData(['tasks', projectId, searchTerm, selectedMemberId], (old: Task[] = []) => {
      return old.filter(task => task.id !== selectedTask.id);
    });

    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast({
        title: 'Task Deleted',
        description: 'The task has been successfully deleted.',
      });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    queryClient.setQueryData(['tasks', projectId, searchTerm, selectedMemberId], (old: Task[] = []) => {
      return old.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
    });

    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'stucked':
        return <Badge className="bg-red-500">Stucked</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500">{status || 'Not Set'}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading || invitationsLoading) {
    return <div className="text-center py-6">Loading tasks...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <div className="mb-4 flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px]">
              <Users className="mr-2 h-4 w-4" />
              {selectedMemberId ? 
                uniqueUsers.find(u => u.id === selectedMemberId) ? `${uniqueUsers.find(u => u.id === selectedMemberId).full_name} ${uniqueUsers.find(u => u.id === selectedMemberId).last_name}` : 'All Members' 
                : 'All Members'}
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedMemberId(null)}>
                All Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueUsers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => setSelectedMemberId(user.id)}
              >
                {`${user.full_name} ${user.last_name}`} ({user.role})
              </DropdownMenuItem>

              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-muted-foreground mb-4">
          {searchTerm
            ? 'No tasks match your search criteria'
            : 'No tasks found for this project'}
        </p>
        <Button onClick={handleCreateTask} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            {selectedMemberId ? 
              uniqueUsers.find(u => u.id === selectedMemberId) ? `${uniqueUsers.find(u => u.id === selectedMemberId).full_name} ${uniqueUsers.find(u => u.id === selectedMemberId).last_name}` : 'All Members' 
              : 'All Members'}
          </Button>

          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedMemberId(null)}>
              All Members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {uniqueUsers.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => setSelectedMemberId(user.id)}
            >
              {`${user.full_name} ${user.last_name}`} ({user.role})
            </DropdownMenuItem>

            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={handleCreateTask} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              {!projectId && <TableHead>Project</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>
                  {task.due_date ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(task.due_date)}
                    </div>
                  ) : (
                    'No due date'
                  )}
                </TableCell>
                {!projectId && (
                  <TableCell>
                    {task.projects ? (
                      <span>
                        {task.projects.project_number} - {task.projects.Sponsor}
                      </span>
                    ) : (
                      'Unknown project'
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center text-red-600"
                          onClick={() => handleDeleteConfirm(task)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => updateTaskStatus(task.id, 'Pending')}
                        >
                          <CircleDashed className="mr-2 h-4 w-4" />
                          Set as Pending
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => updateTaskStatus(task.id, 'In Progress')}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Set as In Progress
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => updateTaskStatus(task.id, 'Completed')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Set as Completed
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => updateTaskStatus(task.id, 'Stucked')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Set as Stucked
                        </DropdownMenuItem>

                        
                        <DropdownMenuItem
                          className="flex items-center"
                          onClick={() => updateTaskStatus(task.id, 'Cancelled')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Set as Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        task={selectedTask}
        projectId={projectId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }}
      />

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{selectedTask?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTask} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksList;
