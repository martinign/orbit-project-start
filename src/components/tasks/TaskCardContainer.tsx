
import React, { useState, useContext, createContext } from 'react';
import { useSubtasks } from '@/hooks/useSubtasks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  project_id: string;
  assigned_to?: string;
  is_gantt_task?: boolean;
  user_id?: string;
  created_at?: string;
  workday_code_id?: string;
}

interface TaskCardContainerProps {
  task: Task;
  index: number;
  children: React.ReactNode;
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleShowUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
}

interface TaskCardContextType {
  handleEditSubtask: (subtask: any) => void;
  handleDeleteSubtaskConfirm: (subtask: any) => void;
  subtasks: any[];
}

export const TaskCardContext = createContext<TaskCardContextType>({
  handleEditSubtask: () => {},
  handleDeleteSubtaskConfirm: () => {},
  subtasks: []
});

export const useTaskCardContext = () => useContext(TaskCardContext);

export const TaskCardContainer: React.FC<TaskCardContainerProps> = ({
  task,
  index,
  children,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleShowUpdates,
  handleAddSubtask,
}) => {
  const [editSubtask, setEditSubtask] = useState<any | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdatesDisplayOpen, setIsUpdatesDisplayOpen] = useState(false);
  const [deleteSubtask, setDeleteSubtask] = useState<any | null>(null);
  const [isDeleteSubtaskDialogOpen, setIsDeleteSubtaskDialogOpen] = useState(false);

  const { subtasks, fetchSubtasks, deleteSubtask: handleDeleteSubtask } = useSubtasks(task.id);

  const handleEditSubtask = (subtask: any) => {
    setEditSubtask(subtask);
    setIsSubtaskDialogOpen(true);
  };

  const handleDeleteSubtaskConfirm = (subtask: any) => {
    setDeleteSubtask(subtask);
    setIsDeleteSubtaskDialogOpen(true);
  };

  const confirmDeleteSubtask = async () => {
    if (!deleteSubtask) return;
    await handleDeleteSubtask(deleteSubtask.id);
    setIsDeleteSubtaskDialogOpen(false);
    setDeleteSubtask(null);
  };

  const contextValue = {
    handleEditSubtask,
    handleDeleteSubtaskConfirm,
    subtasks
  };

  return (
    <TaskCardContext.Provider value={contextValue}>
      {children}

      {isSubtaskDialogOpen && (
        <SubtaskDialog
          open={isSubtaskDialogOpen}
          onClose={() => {
            setIsSubtaskDialogOpen(false);
            setEditSubtask(null);
          }}
          parentTask={task}
          subtask={editSubtask || undefined}
          mode={editSubtask ? 'edit' : 'create'}
          onSuccess={fetchSubtasks}
        />
      )}
      
      {isUpdateDialogOpen && (
        <TaskUpdateDialog
          open={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
          taskId={task.id}
          onSuccess={() => setIsUpdateDialogOpen(false)}
        />
      )}
      
      {isUpdatesDisplayOpen && (
        <TaskUpdatesDisplay
          open={isUpdatesDisplayOpen}
          onClose={() => setIsUpdatesDisplayOpen(false)}
          taskId={task.id}
          taskTitle={task.title}
        />
      )}

      <AlertDialog open={isDeleteSubtaskDialogOpen} onOpenChange={setIsDeleteSubtaskDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subtask</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subtask? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSubtask(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSubtask} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TaskCardContext.Provider>
  );
};
