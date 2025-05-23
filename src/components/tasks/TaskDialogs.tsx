
import React from 'react';
import TaskDialog from '../task-dialog/TaskDialog';
import DeleteTaskDialog from '../DeleteTaskDialog';
import SubtaskDialog from '../SubtaskDialog';
import TaskUpdateDialog from '../TaskUpdateDialog';
import TaskUpdatesDisplay from '../TaskUpdatesDisplay';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string; // Ensure project_id is included in the interface
}

interface TaskDialogsProps {
  selectedTask: Task | null;
  projectId?: string;
  isDialogOpen: boolean;
  isDeleteConfirmOpen: boolean;
  isUpdateDialogOpen: boolean;
  isSubtaskDialogOpen: boolean;
  isCreateTaskDialogOpen: boolean;
  isUpdatesDisplayOpen: boolean;
  isDeleting?: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  setIsUpdateDialogOpen: (open: boolean) => void;
  setIsSubtaskDialogOpen: (open: boolean) => void;
  setIsCreateTaskDialogOpen: (open: boolean) => void;
  setIsUpdatesDisplayOpen: (open: boolean) => void;
  onRefetch: () => void;
  deleteTask: () => void;
  selectedStatus: string;
}

export const TaskDialogs: React.FC<TaskDialogsProps> = ({
  selectedTask,
  projectId,
  isDialogOpen,
  isDeleteConfirmOpen,
  isUpdateDialogOpen,
  isSubtaskDialogOpen,
  isCreateTaskDialogOpen,
  isUpdatesDisplayOpen,
  isDeleting = false,
  setIsDialogOpen,
  setIsDeleteConfirmOpen,
  setIsUpdateDialogOpen,
  setIsSubtaskDialogOpen,
  setIsCreateTaskDialogOpen,
  setIsUpdatesDisplayOpen,
  onRefetch,
  deleteTask,
  selectedStatus
}) => {
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
            isDeleting={isDeleting}
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
