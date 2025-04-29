
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import TaskDialog from '../task-dialog/TaskDialog';
import DeleteTaskDialog from '../DeleteTaskDialog';
import SubtaskDialog from '../SubtaskDialog';
import TaskUpdateDialog from '../TaskUpdateDialog';
import TaskUpdatesDisplay from '../TaskUpdatesDisplay';
import { TaskDialogs } from '../tasks/TaskDialogs';

interface TaskDialogsContainerProps {
  projectId?: string;
  selectedTask: any | null; // We'll keep this as 'any' since it's already typed that way, but ensure parentTask always has project_id
  isDialogOpen: boolean;
  isCreateTaskDialogOpen: boolean;
  isDeleteConfirmOpen: boolean;
  isUpdateDialogOpen: boolean;
  isSubtaskDialogOpen: boolean;
  isUpdatesDisplayOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setIsCreateTaskDialogOpen: (open: boolean) => void;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  setIsUpdateDialogOpen: (open: boolean) => void;
  setIsSubtaskDialogOpen: (open: boolean) => void;
  setIsUpdatesDisplayOpen: (open: boolean) => void;
  deleteTask: () => void;
}

export const TaskDialogsContainer: React.FC<TaskDialogsContainerProps> = ({
  projectId,
  selectedTask,
  isDialogOpen,
  isCreateTaskDialogOpen,
  isDeleteConfirmOpen,
  isUpdateDialogOpen,
  isSubtaskDialogOpen,
  isUpdatesDisplayOpen,
  setIsDialogOpen,
  setIsCreateTaskDialogOpen,
  setIsDeleteConfirmOpen,
  setIsUpdateDialogOpen,
  setIsSubtaskDialogOpen,
  setIsUpdatesDisplayOpen,
  deleteTask
}) => {
  const queryClient = useQueryClient();
  
  const onRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  return (
    <>
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

          <TaskUpdateDialog
            open={isUpdateDialogOpen}
            onClose={() => setIsUpdateDialogOpen(false)}
            taskId={selectedTask.id}
            onSuccess={() => {
              onRefetch();
              setIsUpdateDialogOpen(false);
            }}
          />

          <TaskUpdatesDisplay
            open={isUpdatesDisplayOpen}
            onClose={() => setIsUpdatesDisplayOpen(false)}
            taskId={selectedTask.id}
            taskTitle={selectedTask.title}
          />
        </>
      )}
    </>
  );
};
