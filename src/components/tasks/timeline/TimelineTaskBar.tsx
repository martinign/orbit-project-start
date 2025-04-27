
import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TimelineTaskBarProps {
  task: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  style: React.CSSProperties;
  onClick: () => void;
  durationDays: number;
  isCompleted: boolean;
}

export const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({
  task,
  style,
  onClick,
  durationDays,
  isCompleted,
}) => {
  const startDate = new Date(task.created_at);
  const endDate = isCompleted && task.updated_at ? new Date(task.updated_at) : new Date();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-sm cursor-pointer transition-colors
              ${isCompleted 
                ? 'bg-green-200 hover:bg-green-300' 
                : 'bg-blue-200 hover:bg-blue-300'
              }`}
            style={style}
            onClick={onClick}
          >
            {durationDays > 3 && (
              <div className="px-2 text-xs font-medium truncate flex items-center h-full">
                {durationDays} days {isCompleted ? '(completed)' : '(in progress)'}
              </div>
            )}
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{task.title}</p>
            <p className="text-xs">
              Started: {format(startDate, 'MMM d, yyyy')}
            </p>
            <p className="text-xs">
              {isCompleted 
                ? `Completed: ${format(endDate, 'MMM d, yyyy')}` 
                : `In progress: ${durationDays} days`
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
