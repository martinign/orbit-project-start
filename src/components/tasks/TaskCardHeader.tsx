
import React from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardHeaderProps {
  task: {
    title: string;
    is_private?: boolean;
  };
  subtasksCount: number;
  isExpanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
  updateCount?: number;
}

export const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  task,
  subtasksCount,
  isExpanded,
  toggleExpand,
  updateCount
}) => {
  const hasSubtasks = subtasksCount > 0;
  const isPrivate = task.is_private;
  
  return (
    <div className="flex-1 pr-2">
      <div className="flex items-center gap-1">
        {isPrivate && (
          <Lock className="h-3 w-3 text-gray-500 flex-shrink-0" />
        )}
        <h3 className={cn("font-medium", isPrivate && "text-gray-700")}>
          {task.title}
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
