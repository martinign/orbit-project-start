
import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineTaskBarProps {
  task: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
    user_id?: string;
  };
  style: React.CSSProperties;
  onClick: () => void;
  durationDays: number;
  isCompleted: boolean;
  completionDate?: string;
  hasSubtasks?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (e: React.MouseEvent) => void;
}

export const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({
  task,
  style,
  onClick,
  durationDays,
  isCompleted,
  completionDate,
  hasSubtasks = false,
  isExpanded = false,
  onToggleExpand
}) => {
  const { data: userProfile } = useUserProfile(task.user_id);
  const startDate = new Date(task.created_at);
  const endDate = completionDate ? new Date(completionDate) : 
                  isCompleted && task.updated_at ? new Date(task.updated_at) : new Date();
  
  const getStatusColor = () => {
    if (isCompleted) return 'bg-green-200 hover:bg-green-300 border-green-400';
    
    switch (task.status) {
      case 'in progress': return 'bg-blue-200 hover:bg-blue-300 border-blue-400';
      case 'stucked': return 'bg-red-200 hover:bg-red-300 border-red-400';
      case 'pending': return 'bg-orange-200 hover:bg-orange-300 border-orange-400';
      default: return 'bg-gray-200 hover:bg-gray-300 border-gray-400';
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) return 'bg-green-500 text-white';
    
    switch (task.status) {
      case 'in progress': return 'bg-blue-500 text-white';
      case 'stucked': return 'bg-red-500 text-white';
      case 'pending': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    onClick();
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(e);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-sm cursor-pointer transition-colors border
              ${getStatusColor()} ${hasSubtasks ? 'pr-6' : ''}`}
            style={style}
            onClick={handleClick}
          >
            {durationDays > 3 && (
              <div className="px-2 text-xs font-medium truncate flex items-center h-full">
                {durationDays} days 
                {durationDays > 5 && (
                  <span className={`ml-1 rounded-full text-[10px] py-0 px-1 ${getStatusBadge()}`}>
                    {isCompleted ? '✓' : task.status}
                  </span>
                )}
              </div>
            )}
            
            {hasSubtasks && (
              <button 
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100"
                onClick={handleExpandClick}
              >
                {isExpanded ? 
                  <ChevronUp className="h-3 w-3" /> : 
                  <ChevronDown className="h-3 w-3" />
                }
              </button>
            )}
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 max-w-xs">
            <p className="font-medium">{task.title}</p>
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
                  {isCompleted ? 'Completed' : task.status}
                </span>
              </p>
              {isCompleted && (
                <p className="col-span-2">
                  <span className="text-muted-foreground">Completed:</span> {format(endDate, 'MMM d, yyyy')}
                </p>
              )}
              
              {/* Created by information - now showing full_name and last_name separately */}
              {userProfile && (
                <p className="col-span-2 flex items-center">
                  <User className="inline h-3 w-3 mr-1" />
                  <span className="text-muted-foreground">Created by:</span>{' '}
                  <span className="ml-1">{userProfile.full_name} {userProfile.last_name}</span>
                </p>
              )}
              
              {/* Show if task has subtasks */}
              {hasSubtasks && (
                <p className="col-span-2 text-xs italic mt-1">
                  {isExpanded ? "Click to collapse subtasks" : "Click to expand subtasks"}
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
