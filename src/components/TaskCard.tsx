
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, List, User, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTeamMemberName } from '@/hooks/useTeamMembers';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useSubtasks } from '@/hooks/useSubtasks';
import { useTaskUpdates } from '@/hooks/useTaskUpdates';
import { SubtaskItem } from './tasks/SubtaskItem';
import { TaskActions } from './tasks/TaskActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import SubtaskDialog from './SubtaskDialog';
import TaskUpdateDialog from './TaskUpdateDialog';
import TaskUpdatesDisplay from './TaskUpdatesDisplay';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  assigned_to?: string;
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
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdatesDisplayOpen, setIsUpdatesDisplayOpen] = useState(false);
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

  const handleOpenUpdateDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdateDialogOpen(true);
  };

  const handleShowUpdates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdatesDisplayOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-200 text-orange-800';
      case 'low':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
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
                className="shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full overflow-hidden"
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex items-start gap-2 min-w-0 flex-grow">
                      {subtasks.length > 0 && (
                        <button 
                          className="mt-1 flex-shrink-0" 
                          onClick={toggleExpand}
                          aria-label={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      )}
                      <h4 className="font-medium truncate">{task.title}</h4>
                    </div>
                    
                    <TaskActions
                      task={task}
                      updateCount={updateCount}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteConfirm}
                      onUpdate={handleTaskUpdates}
                      onAddSubtask={handleAddSubtask}
                      onShowUpdates={handleShowUpdates}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2 w-full">
                    <div className="flex flex-wrap items-center gap-2 overflow-hidden w-full">
                      {assignedToName && (
                        <div className="flex items-center text-xs text-gray-600 shrink-0">
                          <User className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{assignedToName}</span>
                        </div>
                      )}
                      
                      {subtasks.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 shrink-0">
                          <List className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {updateCount > 0 && (
                        <div className="flex items-center text-xs text-gray-500 shrink-0">
                          <MessageCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{updateCount} update{updateCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">{task.title}</h4>
                
                {task.description && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Description</h5>
                    <p className="text-sm">{task.description}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 pt-1">
                  {task.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                  
                  {task.due_date && formatDate(task.due_date) && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 flex items-center">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      {formatDate(task.due_date)}
                    </span>
                  )}
                </div>
                
                {assignedToName && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Assigned To</h5>
                    <p className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-1 flex-shrink-0" />
                      {assignedToName}
                    </p>
                  </div>
                )}
              </div>
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
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
