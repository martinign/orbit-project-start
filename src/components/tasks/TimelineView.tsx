
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { TimelineHeader } from './timeline/TimelineHeader';
import { TimelineBody } from './timeline/TimelineBody';
import { TimelineTaskList } from './timeline/TimelineTaskList';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface Task {
  id: string;
  title: string;
  status: string;
  start_date?: string;
  due_date?: string;
  duration_days?: number;
  is_gantt_task?: boolean;
}

interface TimelineViewProps {
  tasks: Task[];
  isLoading?: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks = [], isLoading }) => {
  const [daysToShow, setDaysToShow] = useState(14);
  const queryClient = useQueryClient();
  
  // Add real-time subscription for tasks
  useRealtimeSubscription({
    table: 'project_tasks',
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Format tasks for timeline display
  const formattedTasks = tasks.map(task => {
    const startDate = task.start_date ? new Date(task.start_date) : 
                     (task.due_date ? new Date(new Date(task.due_date).getTime() - (task.duration_days || 1) * 86400000) : new Date());
    
    const endDate = task.due_date ? new Date(task.due_date) :
                   (task.start_date ? addDays(new Date(task.start_date), (task.duration_days || 1)) : addDays(new Date(), 1));

    return {
      ...task,
      startDate,
      endDate,
      durationDays: task.duration_days || Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    };
  });

  // Generate dates for the timeline
  const today = new Date();
  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));

  return (
    <div className="flex h-[400px] border rounded-md overflow-hidden bg-gray-50 relative">
      {isLoading ? (
        <div className="flex items-center justify-center w-full">
          <div className="animate-pulse">Loading timeline...</div>
        </div>
      ) : (
        <>
          <TimelineTaskList tasks={tasks} />
          <div className="flex-1 overflow-auto">
            <TimelineHeader dates={dates} />
            <TimelineBody tasks={formattedTasks} dates={dates} />
          </div>
        </>
      )}
    </div>
  );
};
