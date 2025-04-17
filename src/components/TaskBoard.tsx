import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import TaskDialog from './TaskDialog';

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

// Define column configuration with new order
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

  // Filter tasks into columns based on status
  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => 
      task.status.toLowerCase() === status.toLowerCase()
    );
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return null;
    }
  };

  // Handle task editing
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  // Handle task deletion confirmation
  const handleDeleteConfirm = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteConfirmOpen(true);
  };

  // Delete task
  const deleteTask = async () => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Deleted',
        description: 'The task has been successfully deleted.',
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

  // Handle drag end - update task status in database
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // No destination or dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Get new status based on destination column
    const newStatus = columnsConfig.find(
      col => col.id === destination.droppableId
    )?.status;

    if (!newStatus) return;

    try {
      // Update the task's status in the database
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      toast({
        title: 'Task Updated',
        description: `Task moved to ${columnsConfig.find(col => col.id === destination.droppableId)?.title}`,
      });
      
      // No need to manually refetch as we enabled real-time updates
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
      onRefetch(); // Fallback to refetch if real-time fails
    }
  };

  // Get priority color
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
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnsConfig.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              <div className={`p-3 rounded-t-md ${column.color} border-b-2`}>
                <h3 className="font-medium">{column.title}</h3>
                <Badge className={column.badgeColor}>
                  {getTasksForColumn(column.status).length}
                </Badge>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 rounded-b-md p-2 flex-grow min-h-[200px]"
                  >
                    {getTasksForColumn(column.status).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2 shadow-sm"
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                  <h4 className="font-medium line-clamp-2">{task.title}</h4>
                                  
                                  {task.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex gap-2 mt-3">
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
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Dialog for editing */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{selectedTask?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTask} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskBoard;
