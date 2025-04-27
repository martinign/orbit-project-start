
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TimelineTaskListProps {
  tasks: Array<{
    id: string;
    title: string;
  }>;
}

export const TimelineTaskList: React.FC<TimelineTaskListProps> = ({
  tasks
}) => {
  return (
    <div className="min-w-[80px] bg-background border-r shadow-lg z-20">
      <div className="sticky top-0 h-[82px] border-b bg-background flex items-center px-4 font-medium">
        Tasks
      </div>
      <div className="divide-y">
        {tasks.map(task => (
          <TooltipProvider key={task.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="h-[33px] flex items-center px-3 text-left truncate overflow-hidden whitespace-nowrap hover:bg-gray-50 transition-colors"
                >
                  {task.title}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{task.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};
