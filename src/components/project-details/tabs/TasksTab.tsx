
import React, { useState } from 'react';
import { Kanban, Calendar, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import TaskBoard from '@/components/TaskBoard';
import { TimelineView } from '@/components/tasks/TimelineView';
import TaskDialog from '@/components/TaskDialog';

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
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Tasks</CardTitle>
          <CardDescription>Manage tasks for this project</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isTimelineView ? "Timeline View" : "Board View"}
            </span>
            <Switch 
              checked={isTimelineView} 
              onCheckedChange={setIsTimelineView} 
              className="data-[state=checked]:bg-blue-500" 
            />
            <span className="flex items-center gap-1 text-sm">
              {isTimelineView ? <Calendar className="h-4 w-4" /> : <Kanban className="h-4 w-4" />}
            </span>
          </div>
          <Button 
            onClick={() => setIsTaskDialogOpen(true)} 
            className="bg-blue-500 hover:bg-blue-600" 
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasksLoading ? (
          <div className="text-center py-6">Loading tasks...</div>
        ) : tasks && tasks.length > 0 ? (
          !isTimelineView ? (
            <TaskBoard tasks={tasks} projectId={projectId} onRefetch={refetchTasks} />
          ) : (
            <TimelineView tasks={tasks} isLoading={tasksLoading} />
          )
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground mb-4">
              {!isTimelineView ? 'No tasks found for this project' : 'No tasks available for timeline view'}
            </p>
            <Button 
              onClick={() => setIsTaskDialogOpen(true)} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>
        )}
      </CardContent>

      <TaskDialog 
        open={isTaskDialogOpen} 
        onClose={() => setIsTaskDialogOpen(false)} 
        mode="create" 
        projectId={projectId} 
        onSuccess={() => {
          refetchTasks();
          setIsTaskDialogOpen(false);
        }} 
      />
    </Card>
  );
};
