
import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { getStatusBadge } from '@/utils/statusBadge';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  status: string;
  due_date?: string;
  is_gantt_task?: boolean;
  projects?: {
    project_number: string;
    Sponsor: string;
  };
}

interface TasksTableProps {
  tasks: Task[];
  showProject?: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onTaskUpdates: (task: Task) => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  showProject = true,
  onEditTask,
  onDeleteTask,
  onTaskUpdates,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            {showProject && <TableHead>Project</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {task.title}
                  {task.is_gantt_task && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200/80">
                      G
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell>
                {task.due_date ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(task.due_date)}
                  </div>
                ) : (
                  'No due date'
                )}
              </TableCell>
              {showProject && (
                <TableCell>
                  {task.projects ? (
                    <span>
                      {task.projects.project_number} - {task.projects.Sponsor}
                    </span>
                  ) : (
                    'Unknown project'
                  )}
                </TableCell>
              )}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteTask(task)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
