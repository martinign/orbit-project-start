
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

  // Fetch completion data for completed tasks
  const { data: completionData } = useQuery({
    queryKey: ['task-completion-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_status_history')
        .select('task_id, completion_date, total_duration_days')
        .eq('new_status', 'completed')
        .not('completion_date', 'is', null);

      if (error) throw error;
      return data?.reduce((acc, item) => ({
        ...acc,
        [item.task_id]: item
      }), {}) || {};
    }
  });

  return (
    <div className="relative divide-y">
      {tasks.map((task) => {
        const createdDate = task.created_at ? new Date(task.created_at) : new Date();
        const isCompleted = task.status === 'completed';
        const completionInfo = isCompleted ? completionData?.[task.id] : null;
        
        const daysFromStart = startOfTimeline ? Math.max(
          0, 
          Math.floor((createdDate.getTime() - startOfTimeline.getTime()) / (1000 * 60 * 60 * 24))
        ) : 0;

        // Add debug logs to track values
        console.log('Task:', {
          id: task.id,
          title: task.title,
          status: task.status,
          createdDate,
          isCompleted,
          completionInfo,
          daysFromStart
        });

        let durationDays;
        if (isCompleted && completionInfo?.total_duration_days) {
          durationDays = completionInfo.total_duration_days;
          console.log('Completed task duration:', durationDays);
        } else {
          durationDays = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          console.log('In progress task duration:', durationDays);
        }

        // Ensure minimum width of 1 day
        const finalDuration = Math.max(1, durationDays);

        console.log('Final duration for render:', finalDuration);

        return (
          <div key={task.id} className="h-[33px] relative">
            <TimelineTaskBar
              task={task}
              style={{ 
                left: `${daysFromStart * 30}px`,
                width: `${finalDuration * 30}px`
              }}
              onClick={() => onTaskClick(task)}
              durationDays={durationDays}
              isCompleted={isCompleted}
              completionDate={completionInfo?.completion_date}
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
