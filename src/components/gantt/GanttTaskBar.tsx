
import React from 'react';
import { format } from 'date-fns';
import { GanttTask } from '@/types/gantt';
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical, Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { columnsConfig } from '@/components/tasks/columns-config';
import { getStatusBadge } from '@/utils/statusBadge';

interface GanttTaskBarProps {
  task: GanttTask;
  projectId: string;
  style: React.CSSProperties;
  onEditTask?: (task: GanttTask) => void;
}

export const GanttTaskBar: React.FC<GanttTaskBarProps> = ({ task, projectId, style, onEditTask }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusConfig = columnsConfig.find(config => 
    config.status.toLowerCase() === task.status.toLowerCase()
  ) || columnsConfig[0];

  const updateTaskStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status })
        .eq('id', task.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['gantt_tasks', projectId] });
      
      toast({
        title: "Status Updated",
        description: `Task status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <Card 
        className={`${statusConfig.color} border absolute cursor-pointer transition-colors hover:brightness-95`} 
        style={style}
      >
        <CardContent className="p-2 flex justify-between items-center h-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate text-sm flex-1">
                {task.title}
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-0">
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-bold">{task.title}</h3>
                <div>{getStatusBadge(task.status)}</div>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Start:</span> {task.start_date ? format(new Date(task.start_date), 'MMM dd, yyyy') : 'Not set'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Duration:</span> {task.duration_days || 0} days
                  </p>
                  
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Dependencies:</p>
                      <ul className="list-disc list-inside text-xs space-y-0.5">
                        {task.dependencies.map((depId) => (
                          <li key={depId}>{depId}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div className="p-1 rounded hover:bg-black/10">
                <MoreVertical className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEditTask && onEditTask(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-1 text-xs text-muted-foreground">Status</div>
              {columnsConfig.map(column => (
                <DropdownMenuItem 
                  key={column.id}
                  className="gap-2"
                  onClick={() => updateTaskStatus(column.status)}
                  disabled={task.status === column.status}
                >
                  <div className={`w-3 h-3 rounded-full ${column.badgeColor}`} />
                  {column.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
