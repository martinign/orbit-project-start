
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { TaskDialogsContainer } from './tasks/TaskDialogsContainer';
import { EmptyTasksState } from './tasks/EmptyTasksState';
import { TasksListContent } from './tasks/TasksListContent';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';

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
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
    handleAddSubtask,
    deleteTask,
  } = useTaskManagement(projectId, searchTerm);

  const { data: uniqueUsers = [] } = useProjectTeamMembers(projectId);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', projectId, searchTerm, selectedMemberId],
    queryFn: async () => {
      let query = supabase
        .from('project_tasks')
        .select('*, projects:project_id(id, project_number, Sponsor, project_type)');

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

  if (isLoading) {
    return <div className="text-center py-6">Loading tasks...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <>
        <EmptyTasksState
          users={uniqueUsers}
          selectedMemberId={selectedMemberId}
          onMemberSelect={setSelectedMemberId}
          searchTerm={searchTerm}
          onCreateTask={() => setIsCreateTaskDialogOpen(true)}
        />
        
        <TaskDialogsContainer
          projectId={projectId}
          selectedTask={selectedTask}
          isDialogOpen={isDialogOpen}
          isCreateTaskDialogOpen={isCreateTaskDialogOpen}
          isDeleteConfirmOpen={isDeleteConfirmOpen}
          isUpdateDialogOpen={isUpdateDialogOpen}
          isSubtaskDialogOpen={isSubtaskDialogOpen}
          isUpdatesDisplayOpen={isUpdatesDisplayOpen}
          setIsDialogOpen={setIsDialogOpen}
          setIsCreateTaskDialogOpen={setIsCreateTaskDialogOpen}
          setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
          setIsUpdateDialogOpen={setIsUpdateDialogOpen}
          setIsSubtaskDialogOpen={setIsSubtaskDialogOpen}
          setIsUpdatesDisplayOpen={setIsUpdatesDisplayOpen}
          deleteTask={deleteTask}
        />
      </>
    );
  }

  return (
    <div>
      <TasksListContent
        tasks={tasks}
        users={uniqueUsers}
        selectedMemberId={selectedMemberId}
        onMemberSelect={setSelectedMemberId}
        onCreateTask={() => setIsCreateTaskDialogOpen(true)}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteConfirm}
        onTaskUpdates={handleTaskUpdates}
        showProject={!projectId}
      />

      <TaskDialogsContainer
        projectId={projectId}
        selectedTask={selectedTask}
        isDialogOpen={isDialogOpen}
        isCreateTaskDialogOpen={isCreateTaskDialogOpen}
        isDeleteConfirmOpen={isDeleteConfirmOpen}
        isUpdateDialogOpen={isUpdateDialogOpen}
        isSubtaskDialogOpen={isSubtaskDialogOpen}
        isUpdatesDisplayOpen={isUpdatesDisplayOpen}
        setIsDialogOpen={setIsDialogOpen}
        setIsCreateTaskDialogOpen={setIsCreateTaskDialogOpen}
        setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        setIsUpdateDialogOpen={setIsUpdateDialogOpen}
        setIsSubtaskDialogOpen={setIsSubtaskDialogOpen}
        setIsUpdatesDisplayOpen={setIsUpdatesDisplayOpen}
        deleteTask={deleteTask}
      />
    </div>
  );
};

export default TasksList;
