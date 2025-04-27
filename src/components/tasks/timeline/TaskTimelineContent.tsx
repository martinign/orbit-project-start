
import React from 'react';
import { isToday } from 'date-fns';
import { TimelineTaskBar } from './TimelineTaskBar';

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

  return (
    <div className="relative divide-y">
      {tasks.map((task) => {
        const createdDate = task.created_at ? new Date(task.created_at) : new Date();
        const updatedDate = task.updated_at ? new Date(task.updated_at) : new Date();
        const isCompleted = task.status === 'completed';
        
        const daysFromStart = startOfTimeline ? Math.max(
          0, 
          Math.floor((createdDate.getTime() - startOfTimeline.getTime()) / (1000 * 60 * 60 * 24))
        ) : 0;
        
        const endDate = isCompleted ? updatedDate : today;
        const durationDays = Math.max(
          1, 
          Math.ceil((endDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        );

        return (
          <div key={task.id} className="h-[33px] relative">
            <TimelineTaskBar
              task={task}
              style={{ 
                left: `${daysFromStart * 30}px`,
                width: `${durationDays * 30}px`
              }}
              onClick={() => onTaskClick(task)}
              durationDays={durationDays}
            />
          </div>
        );
      })}

      {/* Today's Line */}
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-20"
        style={{
          left: `${days.findIndex(day => isToday(day)) * 30}px`
        }}
      />
    </div>
  );
};
