
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, MessageSquare, Lock } from 'lucide-react';
import { useWorkdayCodeDetails } from '@/hooks/useWorkdayCodeDetails';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  created_at?: string;
  user_id?: string;
  workday_code_id?: string;
  is_private?: boolean;
}

interface TaskHoverContentProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onAddSubtask: (task: Task) => void;
  onShowUpdates: (task: Task) => void;
  updateCount?: number;
}

export const TaskHoverContent: React.FC<TaskHoverContentProps> = ({
  task,
  onEdit,
  onDelete,
  onUpdate,
  onAddSubtask,
  onShowUpdates,
  updateCount = 0
}) => {
  const { data: codeDetails } = useWorkdayCodeDetails(task.workday_code_id);
  
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-base">{task.title}</h4>
      
      <div className="flex flex-wrap gap-2 items-center">
        {getPriorityBadge()}
        
        {task.is_private && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Private Task
          </Badge>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground">
          {task.description.length > 150 
            ? `${task.description.substring(0, 150)}...` 
            : task.description}
        </p>
      )}
      
      <div className="grid grid-cols-1 gap-1 text-xs">
        {task.due_date && (
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span className="text-muted-foreground mr-1">Due:</span>
            {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
        
        {task.assigned_to && (
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span className="text-muted-foreground mr-1">Assigned to:</span>
            {task.assigned_to}
          </div>
        )}
        
        {codeDetails && (
          <div className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span className="text-muted-foreground mr-1">Workday code:</span>
            {codeDetails.task} - {codeDetails.activity}
          </div>
        )}
        
        {task.created_at && (
          <div className="text-xs text-muted-foreground mt-1">
            Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
};
