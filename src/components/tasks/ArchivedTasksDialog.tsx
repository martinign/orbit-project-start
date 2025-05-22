
import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw } from 'lucide-react';
import { getStatusBadge } from '@/utils/statusBadge';

interface ArchivedTask {
  id: string;
  title: string;
  status: string;
  completion_date?: string;
  total_duration_days?: number;
  project_id: string;
}

interface ArchivedTasksDialogProps {
  archivedTasks: ArchivedTask[];
  isOpen: boolean;
  onClose: () => void;
  onUnarchive: (taskId: string) => void;
  isLoading: boolean;
}

const ArchivedTasksDialog: React.FC<ArchivedTasksDialogProps> = ({
  archivedTasks,
  isOpen,
  onClose,
  onUnarchive,
  isLoading
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Archive className="mr-2 h-5 w-5" />
            Archived Tasks
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading archived tasks...</p>
          </div>
        ) : archivedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No archived tasks found.</p>
          </div>
        ) : (
          <div className="max-h-[50vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{formatDate(task.completion_date)}</TableCell>
                    <TableCell>
                      {task.total_duration_days !== undefined
                        ? `${task.total_duration_days} days`
                        : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUnarchive(task.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Unarchive
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArchivedTasksDialog;
