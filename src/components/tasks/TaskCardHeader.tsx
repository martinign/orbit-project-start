
import React from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardHeaderProps {
  title: string;
  hasSubtasks: boolean;
  isExpanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
  isPrivate?: boolean;
}

export const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  title,
  hasSubtasks,
  isExpanded,
  toggleExpand,
  isPrivate
}) => {
  return (
    <div className="flex-1 pr-2">
      <div className="flex items-center gap-1">
        {isPrivate && (
          <Lock className="h-3 w-3 text-gray-500 flex-shrink-0" />
        )}
        <h3 className={cn("font-medium", isPrivate && "text-gray-700")}>
          {title}
        </h3>
      </div>
      {hasSubtasks && (
        <button
          onClick={toggleExpand}
          className="flex items-center text-xs text-gray-500 mt-1 hover:text-gray-800"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide subtasks
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show subtasks
            </>
          )}
        </button>
      )}
    </div>
  );
};
