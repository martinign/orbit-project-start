
import React, { useMemo } from 'react';
import { eachDayOfInterval, format, startOfToday, addDays } from 'date-fns';
import { GanttTask } from './GanttTask';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface GanttGridProps {
  tasks: any[];
  startDate: Date;
  endDate: Date;
  projectId: string;
  onEditTask?: (task: any) => void;
}

export const GanttGrid: React.FC<GanttGridProps> = ({ 
  tasks, 
  startDate, 
  endDate, 
  projectId,
  onEditTask
}) => {
  const timelineData = useMemo(() => {
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    const columnWidth = 80; // Fixed width for day columns
    return { dates, columnWidth };
  }, [startDate, endDate]);

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
    <div className="relative border rounded-md h-[600px] overflow-hidden">
      <div className="flex h-full">
        {/* Fixed tasks title column */}
        <div className="w-[200px] flex-none border-r bg-background sticky left-0 z-30 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="h-10 border-b bg-muted/50 px-4 flex items-center font-medium sticky top-0">
            Tasks
          </div>
          <div className="divide-y">
            {tasksWithDependencies.map((task) => (
              <div
                key={task.id}
                className="px-4 py-3 hover:bg-accent/50 cursor-pointer h-[48px]"
                onClick={() => onEditTask?.(task)}
              >
                <div className="text-sm font-medium truncate">
                  {task.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable timeline area */}
        <ScrollArea className="flex-1 overflow-x-auto" orientation="horizontal">
          <div style={{ width: contentWidth }}>
            {/* Timeline header */}
            <div className="flex h-10 border-b sticky top-0 bg-muted/50 z-20">
              {timelineData.dates.map((date) => (
                <div
                  key={date.toISOString()}
                  className="flex-shrink-0 border-r px-2 py-1 text-sm font-medium"
                  style={{ width: timelineData.columnWidth }}
                >
                  {format(date, 'MMM dd')}
                </div>
              ))}
            </div>

            {/* Tasks grid */}
            <div className="relative" style={{ height: tasks.length * 48 }}>
              {/* Today marker */}
              <div
                className="absolute top-0 bottom-0 w-px bg-blue-500 z-20"
                style={{
                  left: `${((today.getTime() - startDate.getTime()) / 
                    (endDate.getTime() - startDate.getTime())) * contentWidth}px`
                }}
              />

              {/* Task bars */}
              {tasksWithDependencies.map((task, index) => {
                if (!task.start_date) return null;

                const taskStart = new Date(task.start_date);
                const taskDuration = task.duration_days || 1;
                
                const taskLeft = ((taskStart.getTime() - startDate.getTime()) / 
                  (endDate.getTime() - startDate.getTime())) * contentWidth;
                  
                const taskWidth = taskDuration * timelineData.columnWidth;

                return (
                  <GanttTask
                    key={task.id}
                    task={task}
                    projectId={projectId}
                    style={{
                      left: `${taskLeft}px`,
                      top: index * 48,
                      width: taskWidth,
                      height: 40,
                    }}
                    onEditTask={onEditTask}
                  />
                );
              })}

              {/* Dependencies */}
              {tasksWithDependencies.map((task) => {
                if (!task.dependencyObjects?.length) return null;

                return task.dependencyObjects.map((dependency: any) => {
                  if (!task.start_date || !dependency.start_date) return null;

                  const startTaskStart = new Date(dependency.start_date);
                  const startTaskDuration = dependency.duration_days || 1;
                  const startTaskEnd = addDays(startTaskStart, startTaskDuration);
                  const endTaskStart = new Date(task.start_date);
                  
                  const startLeft = ((startTaskEnd.getTime() - startDate.getTime()) / 
                    (endDate.getTime() - startDate.getTime())) * contentWidth;
                  const endLeft = ((endTaskStart.getTime() - startDate.getTime()) / 
                    (endDate.getTime() - startDate.getTime())) * contentWidth;
                  
                  const startIndex = tasksWithDependencies.findIndex(t => t.id === dependency.id);
                  const endIndex = tasksWithDependencies.findIndex(t => t.id === task.id);
                  
                  const startTop = startIndex * 48 + 20;
                  const endTop = endIndex * 48 + 20;
                  
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
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
