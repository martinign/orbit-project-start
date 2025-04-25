
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TaskCardHeaderProps {
  title: string;
  hasSubtasks: boolean;
  isExpanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
}

export const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  title,
  hasSubtasks,
  isExpanded,
  toggleExpand,
}) => {
  return (
    <div className="flex items-start gap-2 min-w-0 flex-grow">
      {hasSubtasks && (
        <button 
          className="mt-1 flex-shrink-0" 
          onClick={toggleExpand}
          aria-label={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
      )}
      <h4 className="font-medium truncate">{title}</h4>
    </div>
  );
};
