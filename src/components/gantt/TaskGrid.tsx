
import React from 'react';
import { addDays, startOfToday, format } from 'date-fns';
import { GanttTask } from '@/types/gantt';
import { GanttTaskBar } from './GanttTaskBar';

interface TaskGridProps {
  tasks: GanttTask[];
  startDate: Date;
  endDate: Date;
  contentWidth: number;
  columnWidth: number;
  onEditTask?: (task: GanttTask) => void;
  collapsedMonths: Set<string>;
  projectId: string;
}

export const TaskGrid: React.FC<TaskGridProps> = ({
  tasks,
  startDate,
  endDate,
  contentWidth,
  columnWidth,
  onEditTask,
  collapsedMonths,
  projectId,
}) => {
  const today = startOfToday();

  return (
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
      {tasks.map((task, index) => {
        if (!task.start_date) return null;

        const taskStart = new Date(task.start_date);
        const taskDuration = task.duration_days || 1;
        
        const taskLeft = ((taskStart.getTime() - startDate.getTime()) / 
          (endDate.getTime() - startDate.getTime())) * contentWidth;
          
        const taskWidth = taskDuration * columnWidth;

        const taskMonth = format(taskStart, 'MMM yyyy');
        if (collapsedMonths.has(taskMonth)) return null;

        return (
          <GanttTaskBar
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
      {tasks.map((task) => {
        // Safe check for dependencies array existence
        if (!task.dependencies?.length) return null;

        // Filter tasks that are dependencies for the current task
        const dependencyTasks = tasks.filter(depTask => 
          task.dependencies?.includes(depTask.id)
        );

        return dependencyTasks.map((dependency) => {
          if (!task.start_date || !dependency.start_date) return null;

          const startTaskStart = new Date(dependency.start_date);
          const startTaskDuration = dependency.duration_days || 1;
          const startTaskEnd = addDays(startTaskStart, startTaskDuration);
          const endTaskStart = new Date(task.start_date);
          
          const startLeft = ((startTaskEnd.getTime() - startDate.getTime()) / 
            (endDate.getTime() - startDate.getTime())) * contentWidth;
          const endLeft = ((endTaskStart.getTime() - startDate.getTime()) / 
            (endDate.getTime() - startDate.getTime())) * contentWidth;
          
          const startIndex = tasks.findIndex(t => t.id === dependency.id);
          const endIndex = tasks.findIndex(t => t.id === task.id);
          
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
  );
};
