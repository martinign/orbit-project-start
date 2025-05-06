
import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { TooltipProvider } from '@/components/ui/tooltip';
import TaskBoardColumn from './tasks/TaskBoardColumn';
import { TaskDialogs } from './tasks/TaskDialogs';
import { useTaskBoard } from '@/hooks/useTaskBoard';
import { useTaskDragAndDrop } from '@/hooks/useTaskDragAndDrop';
import { columnsConfig } from './tasks/columns-config';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCollapsibleTaskColumns } from '@/hooks/useCollapsibleTaskColumns';
import { useProjectTaskUpdates } from '@/hooks/useProjectTaskUpdates';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
}

interface TaskBoardProps {
  tasks: Task[];
  projectId: string;
  onRefetch: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, projectId, onRefetch }) => {
  const queryClient = useQueryClient();
  const { isColumnCollapsed, toggleColumnCollapsed } = useCollapsibleTaskColumns(projectId);
  const { updateCounts, markTaskUpdatesAsViewed } = useProjectTaskUpdates(projectId);
  
  const {
    selectedTask,
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isUpdatesDisplayOpen,
    isSubtaskDialogOpen,
    isCreateTaskDialogOpen,
    selectedStatus,
    isDeleting,
    isRefetching,
    setIsDialogOpen,
    setIsDeleteConfirmOpen,
    setIsUpdateDialogOpen,
    setIsUpdatesDisplayOpen,
    setIsSubtaskDialogOpen,
    setIsCreateTaskDialogOpen,
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
    handleShowUpdates,
    handleAddSubtask,
    handleCreateTask,
    deleteTask,
  } = useTaskBoard(onRefetch);

  const { handleDragEnd } = useTaskDragAndDrop(onRefetch);

  useEffect(() => {
    const channel = supabase.channel('taskboard-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_tasks'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
        if (onRefetch) onRefetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onRefetch]);

  // Handle when a user views task updates - mark them as viewed
  const handleViewTaskUpdates = (task: Task) => {
    handleShowUpdates(task);
    markTaskUpdatesAsViewed(task.id);
  };

  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => 
      task.status.toLowerCase() === status.toLowerCase()
    );
  };

  return (
    <div className="h-full">
      <TooltipProvider>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${(isDeleting || isRefetching) ? 'opacity-70 pointer-events-none' : ''}`}>
            {columnsConfig.map((column) => (
              <TaskBoardColumn
                key={column.id}
                column={column}
                projectId={projectId}
                tasks={getTasksForColumn(column.status)}
                handleEditTask={handleEditTask}
                handleDeleteConfirm={handleDeleteConfirm}
                handleTaskUpdates={handleTaskUpdates}
                handleShowUpdates={handleViewTaskUpdates}
                handleAddSubtask={handleAddSubtask}
                handleCreateTask={handleCreateTask}
                isColumnCollapsed={isColumnCollapsed}
                toggleColumnCollapsed={toggleColumnCollapsed}
                taskUpdateCounts={updateCounts}
                disabled={isDeleting || isRefetching}
              />
            ))}
          </div>
        </DragDropContext>
      </TooltipProvider>

      <TaskDialogs
        selectedTask={selectedTask}
        projectId={projectId}
        isDialogOpen={isDialogOpen}
        isDeleteConfirmOpen={isDeleteConfirmOpen}
        isUpdateDialogOpen={isUpdateDialogOpen}
        isUpdatesDisplayOpen={isUpdatesDisplayOpen}
        isSubtaskDialogOpen={isSubtaskDialogOpen}
        isCreateTaskDialogOpen={isCreateTaskDialogOpen}
        isDeleting={isDeleting}
        setIsDialogOpen={setIsDialogOpen}
        setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        setIsUpdateDialogOpen={setIsUpdateDialogOpen}
        setIsUpdatesDisplayOpen={setIsUpdatesDisplayOpen}
        setIsSubtaskDialogOpen={setIsSubtaskDialogOpen}
        setIsCreateTaskDialogOpen={setIsCreateTaskDialogOpen}
        onRefetch={onRefetch}
        deleteTask={deleteTask}
        selectedStatus={selectedStatus}
      />
    </div>
  );
};

export default TaskBoard;
