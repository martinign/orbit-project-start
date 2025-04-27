
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
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
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="space-y-4 p-4">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <div className="space-y-2">
            <p>Status: {task.status}</p>
            <p>Created: {format(new Date(task.created_at!), 'PPP')}</p>
            {task.status === 'completed' && task.updated_at && (
              <p>Completed: {format(new Date(task.updated_at), 'PPP')}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
