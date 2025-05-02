
import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  parent_task_id: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

interface SubtaskTimelineBarProps {
  subtask: Subtask;
  style: React.CSSProperties;
  onClick: () => void;
  durationDays: number;
  isCompleted: boolean;
}

export const SubtaskTimelineBar: React.FC<SubtaskTimelineBarProps> = ({
  subtask,
  style,
  onClick,
  durationDays,
  isCompleted
}) => {
  const startDate = new Date(subtask.created_at);
  const endDate = subtask.updated_at ? new Date(subtask.updated_at) : new Date();
  
  const getStatusColor = () => {
    if (isCompleted) return 'bg-green-100 hover:bg-green-200 border-green-300';
    
    switch (subtask.status) {
      case 'in progress': return 'bg-blue-100 hover:bg-blue-200 border-blue-300';
      case 'stucked': return 'bg-red-100 hover:bg-red-200 border-red-300';
      case 'pending': return 'bg-orange-100 hover:bg-orange-200 border-orange-300';
      default: return 'bg-gray-100 hover:bg-gray-200 border-gray-300';
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) return 'bg-green-500 text-white';
    
    switch (subtask.status) {
      case 'in progress': return 'bg-blue-500 text-white';
      case 'stucked': return 'bg-red-500 text-white';
      case 'pending': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`absolute top-1/2 -translate-y-1/2 h-4 rounded-sm cursor-pointer transition-colors border-dashed border
              ${getStatusColor()}`}
            style={style}
            onClick={onClick}
          >
            {durationDays > 2 && (
              <div className="px-1.5 text-[10px] font-medium truncate flex items-center h-full">
                {subtask.title}
                <span className={`ml-1 rounded-full text-[8px] py-0 px-1 ${getStatusBadge()}`}>
                  {isCompleted ? '✓' : subtask.status}
                </span>
              </div>
            )}
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 max-w-xs">
            <p className="font-medium text-sm">Subtask: {subtask.title}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <p>
                <span className="text-muted-foreground">Started:</span> {format(startDate, 'MMM d, yyyy')}
              </p>
              <p>
                <span className="text-muted-foreground">Duration:</span> {durationDays} days
              </p>
              <p className="col-span-2">
                <span className="text-muted-foreground">Status:</span>{' '}
                <span className={`px-1.5 py-0.5 rounded ${getStatusBadge()}`}>
                  {isCompleted ? 'Completed' : subtask.status}
                </span>
              </p>
              {isCompleted && subtask.updated_at && (
                <p className="col-span-2">
                  <span className="text-muted-foreground">Completed:</span> {format(endDate, 'MMM d, yyyy')}
                </p>
              )}
              
              {subtask.description && (
                <p className="col-span-2 mt-1">
                  <span className="text-muted-foreground">Description:</span>{' '}
                  {subtask.description}
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
