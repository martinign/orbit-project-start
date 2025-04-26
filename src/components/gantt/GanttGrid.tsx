import React, { useMemo } from 'react';
import { addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format, startOfToday } from 'date-fns';
import { GanttTask } from './GanttTask';

interface GanttGridProps {
  tasks: any[];
  startDate: Date;
  endDate: Date;
  view: 'day' | 'week' | 'month';
  projectId: string;
  onEditTask?: (task: any) => void;
}

export const GanttGrid: React.FC<GanttGridProps> = ({ 
  tasks, 
  startDate, 
  endDate, 
  view,
  projectId,
  onEditTask
}) => {
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

  const tasksWithDependencies = useMemo(() => {
    return tasks.map(task => {
      const dependencies = tasks.filter(t => 
        task.dependencies && Array.isArray(task.dependencies) && 
        task.dependencies.includes(t.id)
      );
      return { ...task, dependencyObjects: dependencies };
    });
  }, [tasks]);

  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-full" style={{ height: tasks.length * 50 + 40 }}>
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

        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500 z-20"
          style={{
            left: `${((today.getTime() - startDate.getTime()) / 
              (endDate.getTime() - startDate.getTime())) * 100}%`
          }}
        />

        {tasksWithDependencies.map((task, index) => {
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
              projectId={projectId}
              style={{
                left: `${taskLeft}%`,
                top: index * 50 + 40,
                width: taskWidth,
                height: 40,
              }}
              onEditTask={onEditTask}
            />
          );
        })}

        {tasksWithDependencies.map((task) => {
          if (!task.dependencyObjects?.length) return null;

          return task.dependencyObjects.map((dependency: any) => {
            if (!task.start_date || !dependency.start_date) return null;

            const startTaskStart = new Date(dependency.start_date);
            const startTaskDuration = dependency.duration_days || 1;
            const startTaskEnd = addDays(startTaskStart, startTaskDuration);
            const endTaskStart = new Date(task.start_date);
            
            const startLeft = ((startTaskEnd.getTime() - startDate.getTime()) / 
              (endDate.getTime() - startDate.getTime())) * 100;
            const endLeft = ((endTaskStart.getTime() - startDate.getTime()) / 
              (endDate.getTime() - startDate.getTime())) * 100;
            
            const startIndex = tasksWithDependencies.findIndex(t => t.id === dependency.id);
            const endIndex = tasksWithDependencies.findIndex(t => t.id === task.id);
            
            const startTop = startIndex * 50 + 40 + 20;
            const endTop = endIndex * 50 + 40 + 20;
            
            const isValidDependency = startTaskEnd <= endTaskStart;
            
            return (
              <svg
                key={`${dependency.id}-${task.id}`}
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <marker
                    id={`arrowhead-${dependency.id}-${task.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon 
                      points="0 0, 10 3.5, 0 7" 
                      fill={isValidDependency ? "#4B5563" : "#EF4444"}
                    />
                  </marker>
                </defs>
                <path
                  d={`M${startLeft}% ${startTop}
                      C${(startLeft + ((endLeft - startLeft) * 0.5))}% ${startTop},
                      ${(startLeft + ((endLeft - startLeft) * 0.5))}% ${endTop},
                      ${endLeft}% ${endTop}`}
                  stroke={isValidDependency ? "#4B5563" : "#EF4444"}
                  strokeWidth="2"
                  fill="none"
                  markerEnd={`url(#arrowhead-${dependency.id}-${task.id})`}
                  className="transition-colors duration-200 hover:stroke-primary hover:stroke-[3px]"
                />
              </svg>
            );
          });
        })}
      </div>
    </div>
  );
};
