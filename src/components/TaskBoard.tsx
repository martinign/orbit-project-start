import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { TooltipProvider } from '@/components/ui/tooltip';
import TaskBoardColumn from './tasks/TaskBoardColumn';
import { TaskDialogs } from './tasks/TaskDialogs';
import { useTaskBoard } from '@/hooks/useTaskBoard';
import { useTaskDragAndDrop } from '@/hooks/useTaskDragAndDrop';
import { columnsConfig } from './tasks/columns-config';
import { useQueryClient } from 'react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  const {
    selectedTask,
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isSubtaskDialogOpen,
    isCreateTaskDialogOpen,
    selectedStatus,
    setIsDialogOpen,
    setIsDeleteConfirmOpen,
    setIsUpdateDialogOpen,
    setIsSubtaskDialogOpen,
    setIsCreateTaskDialogOpen,
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
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

  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => 
      task.status.toLowerCase() === status.toLowerCase()
    );
  };

  return (
    <div className="h-full">
      <TooltipProvider>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {columnsConfig.map((column) => (
              <TaskBoardColumn
                key={column.id}
                column={column}
                tasks={getTasksForColumn(column.status)}
                handleEditTask={handleEditTask}
                handleDeleteConfirm={handleDeleteConfirm}
                handleTaskUpdates={handleTaskUpdates}
                handleAddSubtask={handleAddSubtask}
                handleCreateTask={handleCreateTask}
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
        isSubtaskDialogOpen={isSubtaskDialogOpen}
        isCreateTaskDialogOpen={isCreateTaskDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        setIsUpdateDialogOpen={setIsUpdateDialogOpen}
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
