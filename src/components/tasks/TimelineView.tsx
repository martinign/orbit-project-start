
import React, { useState } from 'react';
import { format, addDays, startOfMonth, isSameMonth } from 'date-fns';
import { TimelineHeader } from './timeline/TimelineHeader';
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
  const days = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));
  
  // Group days by month for the header
  const months: { month: string; days: number }[] = [];
  let currentMonth = '';
  let monthDays = 0;
  
  days.forEach((day) => {
    const monthName = format(day, 'MMMM yyyy');
    if (monthName !== currentMonth) {
      if (currentMonth) {
        months.push({ month: currentMonth, days: monthDays });
      }
      currentMonth = monthName;
      monthDays = 1;
    } else {
      monthDays++;
    }
  });
  
  // Add the last month
  if (currentMonth && monthDays > 0) {
    months.push({ month: currentMonth, days: monthDays });
  }

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
            <TimelineHeader months={months} days={days} />
            <TimelineBody tasks={formattedTasks} days={days} />
          </div>
        </>
      )}
    </div>
  );
};

interface TimelineBodyProps {
  tasks: (Task & { 
    startDate: Date;
    endDate: Date;
    durationDays: number;
  })[];
  days: Date[];
}

const TimelineBody: React.FC<TimelineBodyProps> = ({ tasks, days }) => {
  return (
    <div className="relative">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 30px)` }}>
        {/* Background grid */}
        <div className="absolute top-0 left-0 w-full h-full grid" style={{ gridTemplateColumns: `repeat(${days.length}, 30px)` }}>
          {days.map((day, i) => (
            <div 
              key={i} 
              className={`border-r border-b h-8 ${format(day, 'eee') === 'Sat' || format(day, 'eee') === 'Sun' ? 'bg-gray-50' : 'bg-white'}`}
            />
          ))}
        </div>
        
        {/* Tasks bars */}
        {tasks.map((task, taskIndex) => {
          // Find the position of the start date in our days array
          const startIndex = days.findIndex(day => 
            day.getDate() === task.startDate.getDate() && 
            day.getMonth() === task.startDate.getMonth() && 
            day.getFullYear() === task.startDate.getFullYear()
          );
          
          // If the start date is before our visible timeline
          const isBeforeTimeline = startIndex === -1;
          
          // Calculate the width (number of days)
          // If task starts before timeline, adjust duration
          const durationToShow = isBeforeTimeline 
            ? Math.min(task.durationDays - Math.abs(startIndex), days.length)
            : Math.min(task.durationDays, days.length - startIndex);
          
          const barStartIndex = Math.max(0, startIndex);
          const barWidth = Math.max(1, durationToShow) * 30; // 30px per day
          
          // Position from left
          const leftPosition = barStartIndex * 30;
          
          const getStatusColor = (status: string) => {
            switch(status.toLowerCase()) {
              case 'completed': return 'bg-green-500';
              case 'in progress': return 'bg-blue-500';
              case 'new': return 'bg-purple-500';
              case 'pending': return 'bg-yellow-500';
              case 'blocked': return 'bg-red-500';
              default: return 'bg-gray-500';
            }
          };
          
          return (
            <div 
              key={task.id}
              className="absolute h-7 rounded-md flex items-center px-2 text-xs text-white font-medium overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
              style={{
                top: `${(taskIndex + 0.5) * 32}px`, // Position vertically
                left: `${leftPosition}px`,
                width: `${barWidth}px`,
                backgroundColor: getStatusColor(task.status),
              }}
              title={task.title}
            >
              {task.title}
            </div>
          );
        })}
      </div>
      
      {/* Task rows */}
      <div className="flex flex-col">
        {tasks.map((task, i) => (
          <div key={task.id} className="h-8 border-b flex items-center">
            &nbsp;
          </div>
        ))}
      </div>
    </div>
  );
};
