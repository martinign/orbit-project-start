
import React, { useState, useEffect } from 'react';
import { Kanban, Calendar, Plus, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import TaskBoard from '@/components/TaskBoard';
import { TimelineView } from '@/components/tasks/TimelineView';
import TaskDialog from '@/components/task-dialog/TaskDialog';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TasksTabProps {
  projectId: string;
  tasks: any[];
  tasksLoading: boolean;
  refetchTasks: () => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  projectId,
  tasks,
  tasksLoading,
  refetchTasks
}) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTimelineView, setIsTimelineView] = useState(false);
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const queryClient = useQueryClient();

  // Filter tasks based on the showPrivateOnly state
  const filteredTasks = showPrivateOnly 
    ? tasks.filter(task => task.is_private) 
    : tasks;

  // Add realtime subscription for task badges
  useEffect(() => {
    const channel = supabase.channel('project-tasks-changes').on('postgres_changes', {
      event: '*',
      // Listen for all events
      schema: 'public',
      table: 'project_tasks',
      filter: `project_id=eq.${projectId}`
    }, () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ["new_tasks_count"]
      });
      queryClient.invalidateQueries({
        queryKey: ["new_items_count", projectId]
      });
      refetchTasks();
    }).subscribe();

    // Add subscription for task updates
    const updateChannel = supabase.channel('project-task-updates').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'project_task_updates'
    }, () => {
      // Invalidate any queries that might be caching task update counts
      queryClient.invalidateQueries({
        queryKey: ['task-updates']
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(updateChannel);
    };
  }, [projectId, queryClient, refetchTasks]);

  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Tasks</CardTitle>
          <CardDescription>Manage tasks for this project</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <Button 
            onClick={() => setShowPrivateOnly(!showPrivateOnly)}
            variant={showPrivateOnly ? "default" : "outline"}
            className={showPrivateOnly ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
            size="sm"
          >
            <Lock className="mr-1 h-4 w-4" />
            {showPrivateOnly ? 'All Tasks' : 'Private Only'}
          </Button>
          
          <Button onClick={() => setIsTaskDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasksLoading ? <div className="text-center py-6 border rounded-lg bg-gray-50">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div> : filteredTasks && filteredTasks.length > 0 ? !isTimelineView ? <TaskBoard tasks={filteredTasks} projectId={projectId} onRefetch={refetchTasks} /> : <TimelineView tasks={filteredTasks} isLoading={tasksLoading} /> : <div className="text-center p-8 border rounded-lg bg-gray-50">
            <p className="text-muted-foreground mb-4">
              {!isTimelineView ? 
                (showPrivateOnly ? 'No private tasks found for this project' : 'No tasks found for this project') : 
                'No tasks available for timeline view'}
            </p>
            <Button onClick={() => setIsTaskDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>}
      </CardContent>

      <TaskDialog open={isTaskDialogOpen} onClose={() => setIsTaskDialogOpen(false)} mode="create" projectId={projectId} onSuccess={() => {
      refetchTasks();
      queryClient.invalidateQueries({
        queryKey: ["new_tasks_count"]
      });
      setIsTaskDialogOpen(false);
    }} />
    </Card>;
};
