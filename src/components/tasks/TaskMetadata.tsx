
import React from 'react';
import { User, List, MessageCircle } from 'lucide-react';

interface TaskMetadataProps {
  assignedToName?: string;
  subtasksCount: number;
  updateCount: number;
}

export const TaskMetadata: React.FC<TaskMetadataProps> = ({
  assignedToName,
  subtasksCount,
  updateCount,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 w-full">
      <div className="flex flex-wrap items-center gap-2 overflow-hidden w-full">
        {assignedToName && (
          <div className="flex items-center text-xs text-gray-600 shrink-0">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{assignedToName}</span>
          </div>
        )}
        
        {subtasksCount > 0 && (
          <div className="flex items-center text-xs text-gray-500 shrink-0">
            <List className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{subtasksCount} subtask{subtasksCount !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        {updateCount > 0 && (
          <div className="flex items-center text-xs text-gray-500 shrink-0">
            <MessageCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{updateCount} update{updateCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
