
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, MessageSquare, Lock } from 'lucide-react';
import { useWorkdayCodeDetails } from '@/hooks/useWorkdayCodeDetails';

interface TaskHoverContentProps {
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  assignedToName?: string;
  createdAt?: string;
  userId?: string;
  workdayCodeId?: string;
  isPrivate?: boolean;
}

export const TaskHoverContent: React.FC<TaskHoverContentProps> = ({
  title,
  description,
  priority,
  dueDate,
  assignedToName,
  createdAt,
  userId,
  workdayCodeId,
  isPrivate
}) => {
  const { data: codeDetails } = useWorkdayCodeDetails(workdayCodeId);
  
  const getPriorityBadge = () => {
    switch (priority) {
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
      <h4 className="font-semibold text-base">{title}</h4>
      
      <div className="flex flex-wrap gap-2 items-center">
        {getPriorityBadge()}
        
        {isPrivate && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Private Task
          </Badge>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">
          {description.length > 150 
            ? `${description.substring(0, 150)}...` 
            : description}
        </p>
      )}
      
      <div className="grid grid-cols-1 gap-1 text-xs">
        {dueDate && (
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span className="text-muted-foreground mr-1">Due:</span>
            {new Date(dueDate).toLocaleDateString()}
          </div>
        )}
        
        {assignedToName && (
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span className="text-muted-foreground mr-1">Assigned to:</span>
            {assignedToName}
          </div>
        )}
        
        {codeDetails && (
          <div className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span className="text-muted-foreground mr-1">Workday code:</span>
            {codeDetails.code} - {codeDetails.description}
          </div>
        )}
        
        {createdAt && (
          <div className="text-xs text-muted-foreground mt-1">
            Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
};
