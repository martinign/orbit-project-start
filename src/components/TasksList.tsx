
import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import TaskDialog from "./TaskDialog";

// Mock data for demonstration
const mockTasks = [
  { 
    id: '1', 
    title: 'Complete project proposal', 
    description: 'Draft and submit the final project proposal by Friday', 
    priority: 'high',
    status: 'in-progress',
    createdAt: new Date().toISOString()
  },
  { 
    id: '2', 
    title: 'Review candidate applications', 
    description: 'Review job applications and shortlist candidates', 
    priority: 'medium',
    status: 'todo',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  { 
    id: '3', 
    title: 'Update documentation', 
    description: 'Update API documentation with recent changes', 
    priority: 'low',
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const TasksList: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteTask = (taskId: string) => {
    // In a real app, this would call an API to delete the task
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
    setIsDeleteDialogOpen(false);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {tasks.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(task.status)}`}>
                    {task.status === 'in-progress' ? 'In Progress' : 
                      task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks found</p>
        </div>
      )}

      {/* Edit Task Dialog */}
      <TaskDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksList;
