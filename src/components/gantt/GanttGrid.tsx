
import React, { useMemo } from 'react';
import { addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format, startOfToday } from 'date-fns';
import { GanttTask } from './GanttTask';
import { ScrollArea } from "@/components/ui/scroll-area";

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
    let columnWidth;

    switch (view) {
      case 'month':
        dates = eachMonthOfInterval({ start: startDate, end: endDate });
        dateFormat = 'MMM yyyy';
        columnWidth = 200; // Wider for months
        break;
      case 'week':
        dates = eachWeekOfInterval({ start: startDate, end: endDate });
        dateFormat = 'MMM dd';
        columnWidth = 140; // Medium for weeks
        break;
      default: // day view
        dates = eachDayOfInterval({ start: startDate, end: endDate });
        dateFormat = 'MMM dd';
        columnWidth = 80; // Narrower for days
    }

    return { dates, dateFormat, columnWidth };
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

  // Calculate total content width based on number of columns and column width
  const contentWidth = timelineData.dates.length * timelineData.columnWidth;

  return (
    <div className="relative">
      <ScrollArea className="h-full border rounded-md">
        <div className="min-w-full" style={{ width: contentWidth, height: tasks.length * 50 + 40 }}>
          <div className="flex border-b sticky top-0 bg-background z-10">
            {timelineData.dates.map((date, index) => (
              <div
                key={date.toISOString()}
                className="flex-shrink-0 border-r px-2 py-1 text-sm font-medium"
                style={{ width: timelineData.columnWidth }}
              >
                {format(date, timelineData.dateFormat)}
              </div>
            ))}
          </div>

          <div
            className="absolute top-0 bottom-0 w-px bg-blue-500 z-20"
            style={{
              left: `${((today.getTime() - startDate.getTime()) / 
                (endDate.getTime() - startDate.getTime())) * contentWidth}px`
            }}
          />

          {tasksWithDependencies.map((task, index) => {
            if (!task.start_date) return null;

            const taskStart = new Date(task.start_date);
            const taskDuration = task.duration_days || 1;
            
            // Calculate position based on pixels instead of percentages
            const taskLeft = ((taskStart.getTime() - startDate.getTime()) / 
              (endDate.getTime() - startDate.getTime())) * contentWidth;
              
            // Calculate width based on duration and column width
            const taskWidth = taskDuration * (timelineData.columnWidth / 
              (view === 'day' ? 1 : view === 'week' ? 7 : 30));

            return (
              <GanttTask
                key={task.id}
                task={task}
                projectId={projectId}
                style={{
                  left: `${taskLeft}px`,
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
              
              // Calculate positions in pixels instead of percentages
              const startLeft = ((startTaskEnd.getTime() - startDate.getTime()) / 
                (endDate.getTime() - startDate.getTime())) * contentWidth;
              const endLeft = ((endTaskStart.getTime() - startDate.getTime()) / 
                (endDate.getTime() - startDate.getTime())) * contentWidth;
              
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
                    d={`M${startLeft} ${startTop}
                        C${(startLeft + ((endLeft - startLeft) * 0.5))} ${startTop},
                        ${(startLeft + ((endLeft - startLeft) * 0.5))} ${endTop},
                        ${endLeft} ${endTop}`}
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
      </ScrollArea>
    </div>
  );
};
