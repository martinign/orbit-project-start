import React, { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Calendar, Edit, Trash2, FilePen, FilePlus, ChevronDown, ChevronRight, List, User } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import SubtaskDialog from './SubtaskDialog';
import { useTeamMemberName } from '@/hooks/useTeamMembers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  parent_task_id: string;
  notes?: string;
  assigned_to?: string;
}

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
  const { toast } = useToast();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editSubtask, setEditSubtask] = useState<Subtask | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [deleteSubtask, setDeleteSubtask] = useState<Subtask | null>(null);
  const [isDeleteSubtaskDialogOpen, setIsDeleteSubtaskDialogOpen] = useState(false);
  const { memberName: assignedToName, isLoading: isLoadingMember } = useTeamMemberName(task.assigned_to);

  useEffect(() => {
    if (task.id) {
      fetchSubtasks();
    }
  }, [task.id]);

  const fetchSubtasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_subtasks')
        .select('*')
        .eq('parent_task_id', task.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'in progress':
        return 'bg-blue-200 text-blue-800';
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditSubtask(subtask);
    setIsSubtaskDialogOpen(true);
  };

  const handleDeleteSubtask = (subtask: Subtask) => {
    setDeleteSubtask(subtask);
    setIsDeleteSubtaskDialogOpen(true);
  };

  const confirmDeleteSubtask = async () => {
    if (!deleteSubtask) return;

    try {
      const { error } = await supabase
        .from('project_subtasks')
        .delete()
        .eq('id', deleteSubtask.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subtask deleted successfully",
      });
      
      fetchSubtasks();
    } catch (error) {
      console.error('Error deleting subtask:', error);
      toast({
        title: "Error",
        description: "Failed to delete subtask. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteSubtaskDialogOpen(false);
      setDeleteSubtask(null);
    }
  };

  const handleAddNewSubtask = () => {
    setEditSubtask(null);
    handleAddSubtask(task);
  };

  const SubtaskItem = ({ subtask }: { subtask: Subtask }) => {
    const { memberName: subtaskAssignedToName } = useTeamMemberName(subtask.assigned_to);
    
    return (
      <div key={subtask.id} className="mb-2 last:mb-0">
        <Card className="shadow-sm">
          <CardContent className="p-2">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-medium">{subtask.title}</h5>
                  <Badge className={getStatusColor(subtask.status)}>
                    {subtask.status}
                  </Badge>
                </div>
                {subtask.description && (
                  <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  {subtask.due_date && formatDate(subtask.due_date) && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-xs text-gray-600">{formatDate(subtask.due_date)}</span>
                    </div>
                  )}
                  {subtaskAssignedToName && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-xs text-gray-600">{subtaskAssignedToName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-1 ml-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubtask(subtask);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Subtask</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubtask(subtask);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Subtask</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided) => (
        <div className="mb-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Card
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="shadow-sm cursor-pointer"
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-1">
                      {subtasks.length > 0 && (
                        <button 
                          className="mt-1 mr-1" 
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
                    <div className="flex flex-col gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteConfirm(task)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 -mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskUpdates(task);
                              }}
                            >
                              <FilePen className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Updates</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 -mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddNewSubtask();
                              }}
                            >
                              <FilePlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add Subtask</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {assignedToName && (
                      <div className="flex items-center text-xs text-gray-600">
                        <User className="h-3 w-3 mr-1" />
                        <span>{assignedToName}</span>
                      </div>
                    )}
                    
                    {subtasks.length > 0 && (
                      <div className="flex gap-1 items-center">
                        <List className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
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
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(task.due_date)}
                    </span>
                  )}
                </div>
                
                {assignedToName && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Assigned To</h5>
                    <p className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {assignedToName}
                    </p>
                  </div>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>

          {isExpanded && subtasks.length > 0 && (
            <div className="ml-6 pl-2 border-l-2 border-gray-300 mt-1">
              {subtasks.map((subtask) => (
                <SubtaskItem key={subtask.id} subtask={subtask} />
              ))}
            </div>
          )}

          {/* Subtask Dialog for Editing */}
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

          {/* Delete Subtask Confirmation Dialog */}
          <AlertDialog open={isDeleteSubtaskDialogOpen} onOpenChange={setIsDeleteSubtaskDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subtask</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this subtask? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteSubtask(null)}>Cancel</AlertDialogCancel>
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
