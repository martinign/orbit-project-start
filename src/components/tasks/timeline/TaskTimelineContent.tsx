
import React from 'react';
import { isToday } from 'date-fns';
import { TimelineTaskBar } from './TimelineTaskBar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

interface TaskTimelineContentProps {
  tasks: Task[];
  days: Date[];
  onTaskClick: (task: Task) => void;
}

export const TaskTimelineContent: React.FC<TaskTimelineContentProps> = ({
  tasks,
  days,
  onTaskClick,
}) => {
  const today = new Date();
  const startOfTimeline = days[0];
  const todayColumnIndex = days.findIndex(day => isToday(day));

  // Fetch the latest status change data for all tasks with duration information
  const { data: statusChangeData } = useQuery({
    queryKey: ['task-status-history', tasks.map(t => t.id)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_status_history')
        .select('task_id, completion_date, total_duration_days, new_status')
        .in('task_id', tasks.map(t => t.id))
        .order('changed_at', { ascending: false });

      if (error) throw error;
      
      // Get the most recent status change for each task
      const latestStatusChanges = data?.reduce((acc, change) => {
        if (!acc[change.task_id]) {
          acc[change.task_id] = change;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('Latest status changes:', latestStatusChanges);
      return latestStatusChanges;
    }
  });

  return (
    <div className="relative divide-y">
      {tasks.map((task) => {
        const createdDate = task.created_at ? new Date(task.created_at) : new Date();
        const isCompleted = task.status === 'completed';
        const statusChange = statusChangeData?.[task.id];
        
        console.log(`Task ${task.id} (${task.title}):`, {
          status: task.status,
          statusChange,
          createdDate: createdDate.toISOString(),
          isCompleted
        });

        const daysFromStart = startOfTimeline ? Math.max(
          0, 
          Math.floor((createdDate.getTime() - startOfTimeline.getTime()) / (1000 * 60 * 60 * 24))
        ) : 0;

        let durationDays;
        if (isCompleted && statusChange) {
          // For completed tasks, use the total_duration_days from status history
          durationDays = statusChange.total_duration_days || 1; // Fallback to 1 if NULL
          console.log(`Task ${task.id} completed duration from history:`, durationDays);
        } else {
          // For in-progress tasks, calculate current duration
          durationDays = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`Task ${task.id} calculated duration:`, durationDays);
        }

        // Always ensure a minimum width of 1 day
        const finalDuration = Math.max(1, durationDays);

        return (
          <div key={task.id} className="h-[33px] relative">
            <TimelineTaskBar
              task={task}
              style={{ 
                left: `${daysFromStart * 30}px`,
                width: `${finalDuration * 30}px`
              }}
              onClick={() => onTaskClick(task)}
              durationDays={finalDuration}
              isCompleted={isCompleted}
              completionDate={statusChange?.completion_date}
            />
          </div>
        );
      })}

      {/* Today's Line */}
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-20"
        style={{
          left: `${todayColumnIndex * 30}px`
        }}
      />
    </div>
  );
};
