
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
    status?: string;
  }>;
  width?: number;
}

export const TimelineTaskList: React.FC<TimelineTaskListProps> = ({
  tasks,
  width
}) => {
  const getStatusIndicator = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-blue-500';
      case 'stucked': return 'bg-red-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <div className="min-w-[120px] bg-background border-r h-full overflow-auto" style={width ? { width: `${width}px` } : undefined}>
      <div className="sticky top-0 z-20 bg-background">
        {/* Match the double-header height of timeline */}
        <div className="h-8 border-b flex items-center px-4 font-medium">Tasks</div>
        <div className="h-8 border-b" /> {/* Spacer to match timeline's day row */}
      </div>
      <div className="divide-y">
        {tasks.map(task => (
          <TooltipProvider key={task.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="h-[33px] flex items-center px-3 text-left truncate overflow-hidden whitespace-nowrap hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusIndicator(task.status)}`}></div>
                  <span className="truncate">{task.title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  <p className="font-medium">{task.title}</p>
                  {task.status && <p className="text-xs text-muted-foreground">Status: {task.status}</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};
