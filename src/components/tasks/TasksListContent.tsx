
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { TaskMemberFilter } from './TaskMemberFilter';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  CircleAlert, 
  Clock, 
  MessageCircle,
  Lock
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { getPriorityBadge, getStatusBadge } from '@/utils/statusBadge';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  assigned_to?: string;
  created_at?: string;
  is_private?: boolean;
  projects?: {
    id: string;
    project_number: string;
    Sponsor: string;
    project_type: string;
  }
}

interface TasksListContentProps {
  tasks: Task[];
  users: any[];
  selectedMemberId: string | null;
  onMemberSelect: (id: string | null) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onTaskUpdates: (task: Task) => void;
  showProject?: boolean;
}

export const TasksListContent: React.FC<TasksListContentProps> = ({
  tasks,
  users,
  selectedMemberId,
  onMemberSelect,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onTaskUpdates,
  showProject = true
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <TaskMemberFilter
          users={users}
          selectedMemberId={selectedMemberId}
          onMemberSelect={onMemberSelect}
        />
        
        <Button onClick={onCreateTask} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="mr-1 h-4 w-4" /> Create Task
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              {showProject && <TableHead>Project</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    {task.is_private && (
                      <Lock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                    )}
                    <span>{task.title}</span>
                  </div>
                </TableCell>
                {showProject && (
                  <TableCell>
                    {task.projects?.project_number} - {task.projects?.Sponsor}
                  </TableCell>
                )}
                <TableCell>
                  {getStatusBadge(task.status)}
                </TableCell>
                <TableCell>
                  {getPriorityBadge(task.priority)}
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span className="text-sm">
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No due date</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.created_at && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {formatDistance(new Date(task.created_at), new Date(), { addSuffix: true })}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onTaskUpdates(task)}
                    className="h-8 w-8 p-0"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="sr-only">Updates</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditTask(task)}
                    className="h-8 w-8 p-0"
                  >
                    <CircleAlert className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
