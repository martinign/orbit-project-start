
import React from 'react';
import { Users, MessageSquare, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TaskMetadataProps {
  dueDate?: string;
  assignedTo?: string;
  subtasksCount?: number;
  updateCount?: number;
  isPrivate?: boolean;
}

export const TaskMetadata: React.FC<TaskMetadataProps> = ({
  dueDate,
  assignedTo,
  subtasksCount = 0,
  updateCount = 0,
  isPrivate = false
}) => {
  return (
    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
      {assignedTo && (
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {assignedTo}
        </div>
      )}
      
      {subtasksCount > 0 && (
        <div className="flex items-center">
          <span className="mr-1">{subtasksCount} subtask{subtasksCount !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      {updateCount > 0 && (
        <div className="flex items-center">
          <MessageSquare className="h-3 w-3 mr-1" />
          <Badge variant="secondary" className="px-1 py-0">
            {updateCount}
          </Badge>
        </div>
      )}
      
      {isPrivate && (
        <div className="flex items-center ml-auto">
          <Lock className="h-3 w-3 mr-1" />
          <span>Private</span>
        </div>
      )}
    </div>
  );
};
