
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TasksTable } from './tasks/TasksTable';
import { TaskMemberFilter } from './tasks/TaskMemberFilter';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import TaskDialog from './TaskDialog';
import DeleteTaskDialog from './DeleteTaskDialog';
import SubtaskDialog from './SubtaskDialog';
import TaskUpdateDialog from './TaskUpdateDialog';
import TaskUpdatesDisplay from './TaskUpdatesDisplay';

interface TasksListProps {
  projectId?: string;
  searchTerm?: string;
}

const TasksList: React.FC<TasksListProps> = ({ projectId, searchTerm = '' }) => {
  const queryClient = useQueryClient();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isUpdatesDisplayOpen, setIsUpdatesDisplayOpen] = useState(false);

  const {
    selectedTask,
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isSubtaskDialogOpen,
    setIsDialogOpen,
    setIsDeleteConfirmOpen,
    setIsUpdateDialogOpen,
    setIsSubtaskDialogOpen,
    setSelectedTask,
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
    handleAddSubtask,
    deleteTask,
    handleShowTaskUpdates,
  } = useTaskManagement(projectId, searchTerm);

  const { data: uniqueUsers = [] } = useQuery({
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

      const userMap = new Map();
      invitations.forEach((invitation) => {
        const inviter = profiles.find(p => p.id === invitation.inviter_id);
        const invitee = profiles.find(p => p.id === invitation.invitee_id);

        if (inviter) {
          userMap.set(inviter.id, {
            ...inviter,
            role: 'Inviter'
          });
        }
        if (invitee && invitation.status === 'accepted') {
          userMap.set(invitee.id, {
            ...invitee,
            role: 'Invitee'
          });
        }
      });

      return Array.from(userMap.values());
    },
    enabled: !!projectId
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
      return data;
    },
  });

  useRealtimeSubscription({
    table: 'project_tasks',
    filter: projectId ? 'project_id' : undefined,
    filterValue: projectId || undefined,
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleShowUpdates = (task: any) => {
    setSelectedTask(task);
    setIsUpdatesDisplayOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading tasks...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <div className="mb-4 flex justify-center">
          <TaskMemberFilter
            users={uniqueUsers}
            selectedMemberId={selectedMemberId}
            onMemberSelect={setSelectedMemberId}
          />
        </div>
        <p className="text-muted-foreground mb-4">
          {searchTerm
            ? 'No tasks match your search criteria'
            : 'No tasks found for this project'}
        </p>
        <Button onClick={() => setIsCreateTaskDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TaskMemberFilter
          users={uniqueUsers}
          selectedMemberId={selectedMemberId}
          onMemberSelect={setSelectedMemberId}
        />
        <Button onClick={() => setIsCreateTaskDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      <TasksTable
        tasks={tasks}
        showProject={!projectId}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteConfirm}
        onTaskUpdates={handleTaskUpdates}
      />

      <TaskDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode="edit"
        task={selectedTask}
        projectId={projectId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          setIsDialogOpen(false);
        }}
      />

      <TaskDialog
        open={isCreateTaskDialogOpen}
        onClose={() => setIsCreateTaskDialogOpen(false)}
        mode="create"
        projectId={projectId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          setIsCreateTaskDialogOpen(false);
        }}
      />

      {selectedTask && (
        <>
          <DeleteTaskDialog
            open={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
            taskTitle={selectedTask.title}
            onDelete={deleteTask}
          />

          <SubtaskDialog
            open={isSubtaskDialogOpen}
            onClose={() => setIsSubtaskDialogOpen(false)}
            parentTask={selectedTask}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['tasks'] });
              setIsSubtaskDialogOpen(false);
            }}
          />

          <TaskUpdateDialog
            open={isUpdateDialogOpen}
            onClose={() => setIsUpdateDialogOpen(false)}
            taskId={selectedTask.id}
            onSuccess={() => setIsUpdateDialogOpen(false)}
          />

          <TaskUpdatesDisplay
            open={isUpdatesDisplayOpen}
            onClose={() => setIsUpdatesDisplayOpen(false)}
            taskId={selectedTask.id}
            taskTitle={selectedTask.title}
          />
        </>
      )}
    </div>
  );
};

export default TasksList;
