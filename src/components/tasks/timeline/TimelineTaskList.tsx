
import React from 'react';

interface TimelineTaskListProps {
  tasks: Array<{
    id: string;
    title: string;
  }>;
}

export const TimelineTaskList: React.FC<TimelineTaskListProps> = ({ tasks }) => {
  return (
    <div className="w-[200px] flex-none bg-background border-r shadow-lg z-20">
      <div className="sticky top-0 p-2 font-medium border-b bg-background">
        Task
      </div>
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-2 border-b truncate"
            title={task.title}
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
};
