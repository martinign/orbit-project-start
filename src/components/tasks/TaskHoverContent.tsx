
import React from 'react';
import { Calendar, Clock, User, Code, AlertCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskHoverContentProps {
  description?: string;
  priority: string;
  dueDate?: string;
  createdAt?: string;
  userId?: string;
  workdayCodeId?: string;
  isPrivate?: boolean;
}

export const TaskHoverContent: React.FC<TaskHoverContentProps> = ({
  description,
  priority,
  dueDate,
  createdAt,
  userId,
  workdayCodeId,
  isPrivate
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
      {description && (
        <div className="text-sm text-gray-600">
          <p className="line-clamp-2">{description}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <Badge variant="outline" className={`flex items-center gap-1 ${getPriorityColor(priority)}`}>
          <AlertCircle className="h-3 w-3" />
          {priority} Priority
        </Badge>

        {dueDate && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Due: {format(new Date(dueDate), 'MMM dd')}
          </Badge>
        )}

        {createdAt && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Created: {format(new Date(createdAt), 'MMM dd')}
          </Badge>
        )}

        {workdayCodeId && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Workday
          </Badge>
        )}

        {isPrivate && (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-300">
            <Shield className="h-3 w-3" />
            Private
          </Badge>
        )}
      </div>
    </div>
  );
};
