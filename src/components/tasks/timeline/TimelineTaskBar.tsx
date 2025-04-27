
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
}

export const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({
  task,
  style,
  onClick,
  durationDays,
}) => {
  const isCompleted = task.status === 'completed';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`absolute top-2 h-6 rounded-md cursor-pointer transition-colors
              ${isCompleted ? 'bg-green-200 hover:bg-green-300' : 'bg-blue-200 hover:bg-blue-300'}`}
            style={style}
            onClick={onClick}
          >
            {durationDays > 3 && (
              <div className="px-2 text-xs font-medium truncate flex items-center h-full">
                {durationDays} days {isCompleted ? '(completed)' : ''}
              </div>
            )}
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{task.title}</p>
            <p className="text-xs">
              Started: {format(new Date(task.created_at), 'MMM d, yyyy')}
            </p>
            <p className="text-xs">
              {isCompleted 
                ? `Completed: ${format(new Date(task.updated_at), 'MMM d, yyyy')}` 
                : 'In progress'}
            </p>
            <p className="text-xs">Duration: {durationDays} days</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
