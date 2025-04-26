
import React, { useState, useMemo } from 'react';
import { addDays, startOfMonth } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { GanttToolbar } from './GanttToolbar';
import { GanttGrid } from './GanttGrid';
import GanttTaskDialog from './GanttTaskDialog';

interface GanttChartProps {
  tasks: any[];
  projectId: string;
  onRefetch?: () => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, projectId, onRefetch }) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const { startDate, endDate } = useMemo(() => {
    // Find the earliest start date from tasks
    const firstDate = tasks.length > 0 
      ? tasks.reduce((earliest, task) => {
          if (!task.start_date) return earliest;
          const taskDate = new Date(task.start_date);
          return taskDate < earliest ? taskDate : earliest;
        }, new Date())
      : new Date();

    // Calculate the latest end date based on task durations
    const lastDate = tasks.length > 0
      ? tasks.reduce((latest, task) => {
          if (!task.start_date || !task.duration_days) return latest;
          const taskEnd = addDays(new Date(task.start_date), task.duration_days);
          return taskEnd > latest ? taskEnd : latest;
        }, addDays(new Date(), 30))
      : addDays(new Date(), 30);

    // Extend the range to show some context
    const start = startOfMonth(firstDate);
    const end = addDays(lastDate, 14); // Add 2 weeks for context

    return { startDate: start, endDate: end };
  }, [tasks]);

  const handleOpenTaskDialog = (task?: any) => {
    setSelectedTask(task || null);
    setIsTaskDialogOpen(true);
  };

  const handleTaskSuccess = () => {
    if (onRefetch) onRefetch();
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <GanttToolbar />
          <Button 
            onClick={() => handleOpenTaskDialog()} 
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="relative bg-white rounded-md border w-full">
          {/* The fixed-width container for the Gantt chart */}
          <div className="w-full overflow-hidden">
            <GanttGrid
              tasks={tasks}
              startDate={startDate}
              endDate={endDate}
              projectId={projectId}
              onEditTask={handleOpenTaskDialog}
            />
          </div>
        </div>

        {isTaskDialogOpen && (
          <GanttTaskDialog
            projectId={projectId}
            open={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen(false)}
            task={selectedTask}
            mode={selectedTask ? 'edit' : 'create'}
            onSuccess={handleTaskSuccess}
          />
        )}
      </div>
    </Card>
  );
};
