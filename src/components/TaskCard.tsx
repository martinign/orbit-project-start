
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { useTeamMemberName } from '@/hooks/useTeamMembers';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useSubtasks } from '@/hooks/useSubtasks';
import { useTaskUpdates } from '@/hooks/useTaskUpdates';
import { SubtaskItem } from './tasks/SubtaskItem';
import { TaskActions } from './tasks/TaskActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import SubtaskDialog from './SubtaskDialog';
import { TaskCardHeader } from './tasks/TaskCardHeader';
import { TaskMetadata } from './tasks/TaskMetadata';
import { TaskHoverContent } from './tasks/TaskHoverContent';

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
}

interface TaskCardProps {
  task: Task;
  index: number;
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleAddSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editSubtask, setEditSubtask] = useState<any | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [deleteSubtask, setDeleteSubtask] = useState<any | null>(null);
  const [isDeleteSubtaskDialogOpen, setIsDeleteSubtaskDialogOpen] = useState(false);

  const { memberName: assignedToName } = useTeamMemberName(task.assigned_to);
  const { subtasks, fetchSubtasks, deleteSubtask: handleDeleteSubtask } = useSubtasks(task.id);
  const { updateCount } = useTaskUpdates(task.id);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

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

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div className="mb-0">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Card
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full overflow-hidden ${
                  task.is_gantt_task ? 'bg-[#F2FCE2]' : ''
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start w-full">
                    <TaskCardHeader
                      title={task.title}
                      hasSubtasks={subtasks.length > 0}
                      isExpanded={isExpanded}
                      toggleExpand={toggleExpand}
                    />
                    
                    <TaskActions
                      task={task}
                      updateCount={updateCount}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => handleDeleteConfirm(task)}
                      onUpdate={() => handleTaskUpdates(task)}
                      onAddSubtask={() => handleAddSubtask(task)}
                      onShowUpdates={() => handleShowUpdates(task)} 
                    />
                  </div>

                  <TaskMetadata
                    assignedToName={assignedToName}
                    subtasksCount={subtasks.length}
                    updateCount={updateCount}
                  />
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <TaskHoverContent
                title={task.title}
                description={task.description}
                priority={task.priority}
                dueDate={task.due_date}
                assignedToName={assignedToName}
              />
            </HoverCardContent>
          </HoverCard>

          {isExpanded && subtasks.length > 0 && (
            <div className="ml-7 pl-2 border-l-2 border-gray-300 mt-2 mb-2">
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onEdit={handleEditSubtask}
                    onDelete={handleDeleteSubtaskConfirm}
                  />
                ))}
              </div>
            </div>
          )}

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
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
