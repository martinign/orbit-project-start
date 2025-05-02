
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSubtasks } from '@/hooks/useSubtasks';
import { Separator } from '@/components/ui/separator';

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  description?: string;
  priority?: string;
}

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onOpenChange,
}) => {
  const { subtasks, isLoading } = useSubtasks(task?.id || '');
  
  if (!task) return null;

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'stucked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSubtaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'stucked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getStatusColor()}>
              {task.status}
            </Badge>
            {task.priority && (
              <Badge variant="outline" className={getPriorityColor()}>
                {task.priority} priority
              </Badge>
            )}
          </div>
          
          {task.description && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {task.created_at ? format(new Date(task.created_at), 'PPP') : 'N/A'}
            </div>
            
            {task.status === 'completed' && task.updated_at && (
              <div>
                <span className="font-medium">Completed:</span>{' '}
                {format(new Date(task.updated_at), 'PPP')}
              </div>
            )}
          </div>
          
          {/* Subtasks section */}
          {subtasks && subtasks.length > 0 && (
            <div className="mt-4">
              <Separator className="my-2" />
              <h4 className="text-sm font-medium mb-2">Subtasks ({subtasks.length})</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="bg-slate-50 p-2 rounded-md border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subtask.title}</span>
                      <Badge variant="outline" className={getSubtaskStatusColor(subtask.status)}>
                        {subtask.status}
                      </Badge>
                    </div>
                    {subtask.description && (
                      <p className="text-xs text-muted-foreground mt-1">{subtask.description}</p>
                    )}
                    {subtask.due_date && (
                      <p className="text-xs mt-1">
                        <span className="font-medium">Due:</span>{' '}
                        {format(new Date(subtask.due_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
