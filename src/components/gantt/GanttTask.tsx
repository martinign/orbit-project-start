
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusBadge } from '@/utils/statusBadge';

interface GanttTaskProps {
  task: {
    id: string;
    title: string;
    status: string;
    start_date?: string | null;
    duration_days?: number | null;
  };
  style: React.CSSProperties;
}

const statusColors = {
  'not started': 'bg-gray-100',
  'pending': 'bg-yellow-100',
  'in progress': 'bg-blue-100',
  'completed': 'bg-green-100',
  'stucked': 'bg-red-100',
};

export const GanttTask: React.FC<GanttTaskProps> = ({ task, style }) => {
  const statusColor = statusColors[task.status.toLowerCase()] || 'bg-gray-100';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={`${statusColor} border absolute cursor-pointer transition-colors hover:brightness-95`} 
            style={style}
          >
            <CardContent className="p-2 truncate text-sm">
              {task.title}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{task.title}</p>
            <div>{getStatusBadge(task.status)}</div>
            <p className="text-sm">
              Start: {task.start_date ? format(new Date(task.start_date), 'MMM dd, yyyy') : 'Not set'}
            </p>
            <p className="text-sm">
              Duration: {task.duration_days || 0} days
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
