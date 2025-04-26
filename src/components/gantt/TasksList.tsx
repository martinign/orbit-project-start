
import React from 'react';
import { GanttTask } from '@/types/gantt';

interface TasksListProps {
  tasks: GanttTask[];
  onEditTask?: (task: GanttTask) => void;
}

export const TasksList: React.FC<TasksListProps> = ({ tasks, onEditTask }) => {
  return (
    <div className="w-[200px] h-full flex-none border-r bg-background sticky left-0 z-30 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="h-[80px] border-b bg-muted/50 px-4 flex items-center font-medium sticky top-0 z-10">
        Tasks
      </div>
      <div className="divide-y overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="px-4 py-3 hover:bg-accent/50 cursor-pointer h-[48px] flex items-center"
            onClick={() => onEditTask?.(task)}
          >
            <div className="text-sm font-medium truncate">
              {task.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
