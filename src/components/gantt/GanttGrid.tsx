
import React, { useMemo } from 'react';
import { addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format, startOfToday } from 'date-fns';
import { GanttTask } from './GanttTask';

interface GanttGridProps {
  tasks: any[];
  startDate: Date;
  endDate: Date;
  view: 'day' | 'week' | 'month';
}

export const GanttGrid: React.FC<GanttGridProps> = ({ tasks, startDate, endDate, view }) => {
  const timelineData = useMemo(() => {
    let dates;
    let dateFormat;

    switch (view) {
      case 'month':
        dates = eachMonthOfInterval({ start: startDate, end: endDate });
        dateFormat = 'MMM yyyy';
        break;
      case 'week':
        dates = eachWeekOfInterval({ start: startDate, end: endDate });
        dateFormat = 'MMM dd';
        break;
      default:
        dates = eachDayOfInterval({ start: startDate, end: endDate });
        dateFormat = 'MMM dd';
    }

    return { dates, dateFormat };
  }, [startDate, endDate, view]);

  const today = startOfToday();

  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-full" style={{ height: tasks.length * 50 + 40 }}>
        {/* Timeline header */}
        <div className="flex border-b sticky top-0 bg-background z-10">
          {timelineData.dates.map((date, index) => (
            <div
              key={date.toISOString()}
              className="flex-shrink-0 border-r px-2 py-1 text-sm font-medium"
              style={{ width: view === 'month' ? 120 : 80 }}
            >
              {format(date, timelineData.dateFormat)}
            </div>
          ))}
        </div>

        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500 z-20"
          style={{
            left: `${((today.getTime() - startDate.getTime()) / 
              (endDate.getTime() - startDate.getTime())) * 100}%`
          }}
        />

        {/* Tasks */}
        {tasks.map((task, index) => {
          if (!task.start_date) return null;

          const taskStart = new Date(task.start_date);
          const taskDuration = task.duration_days || 1;
          const taskWidth = (taskDuration * (view === 'month' ? 120 : 80));
          const taskLeft = ((taskStart.getTime() - startDate.getTime()) / 
            (endDate.getTime() - startDate.getTime())) * 100;

          return (
            <GanttTask
              key={task.id}
              task={task}
              style={{
                left: `${taskLeft}%`,
                top: index * 50 + 40,
                width: taskWidth,
                height: 40,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
