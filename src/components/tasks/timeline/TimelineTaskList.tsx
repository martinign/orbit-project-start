
import React from 'react';

interface TimelineTaskListProps {
  tasks: Array<{
    id: string;
    title: string;
  }>;
}

export const TimelineTaskList: React.FC<TimelineTaskListProps> = ({
  tasks
}) => {
  return (
    <div className="w-[200px] flex-none bg-background border-r shadow-lg z-20">
      <div className="sticky top-0 h-[82px] border-b bg-background flex items-center justify-center font-medium">
        Tasks
      </div>
      <div className="divide-y">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="h-[33px] flex items-center justify-center px-2 truncate hover:bg-gray-50 transition-colors"
            title={task.title}
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
};
