
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

import TaskColumn from './TaskColumn';
import TaskDialog from './TaskDialog';
import DeleteTaskDialog from './DeleteTaskDialog';
import SubtaskDialog from './SubtaskDialog';

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

const columnsConfig = [
  {
    id: 'not-started',
    title: 'Not Started',
    status: 'not started',
    color: 'bg-gray-100 border-gray-300',
    badgeColor: 'bg-gray-500',
  },
  {
    id: 'pending',
    title: 'Pending',
    status: 'pending',
    color: 'bg-yellow-100 border-yellow-300',
    badgeColor: 'bg-yellow-500',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in progress',
    color: 'bg-blue-100 border-blue-300',
    badgeColor: 'bg-blue-500',
  },
  {
    id: 'completed',
    title: 'Completed',
    status: 'completed',
    color: 'bg-green-100 border-green-300',
    badgeColor: 'bg-green-500',
  },
];

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, projectId, onRefetch }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => 
      task.status.toLowerCase() === status.toLowerCase()
    );
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteConfirmOpen(true);
  };

  const handleTaskUpdates = (task: Task) => {
    setSelectedTask(task);
    setIsUpdateDialogOpen(true);
    toast({
      title: "Updates Feature",
      description: "Updates functionality will be implemented soon.",
    });
  };

  const handleAddSubtask = (task: Task) => {
    setSelectedTask(task);
    setIsSubtaskDialogOpen(true);
  };

  const handleCreateTask = (status: string) => {
    setSelectedStatus(status);
    setIsCreateTaskDialogOpen(true);
  };

  const deleteTask = async () => {
    if (!selectedTask) return;

    try {
      // First, delete all subtasks associated with this task
      const { error: subtasksError } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('parent_task_id', selectedTask.id);

      if (subtasksError) throw subtasksError;

      // Then delete the task itself
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Deleted',
        description: 'The task and its subtasks have been successfully deleted.',
      });
      onRefetch();
    } catch (error) {
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

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const newStatus = columnsConfig.find(
      col => col.id === destination.droppableId
    )?.status;

    if (!newStatus) return;

    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      toast({
        title: 'Task Updated',
        description: `Task moved to ${columnsConfig.find(col => col.id === destination.droppableId)?.title}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
      onRefetch();
    }
  };

  return (
    <div className="h-full">
      <TooltipProvider>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columnsConfig.map((column) => (
              <TaskColumn
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

      <TaskDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode="edit"
        task={selectedTask}
        projectId={projectId}
        onSuccess={() => {
          onRefetch();
          setIsDialogOpen(false);
        }}
      />

      <TaskDialog
        open={isCreateTaskDialogOpen}
        onClose={() => setIsCreateTaskDialogOpen(false)}
        mode="create"
        projectId={projectId}
        task={{ status: selectedStatus }}
        onSuccess={() => {
          onRefetch();
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
              onRefetch();
              setIsSubtaskDialogOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default TaskBoard;
