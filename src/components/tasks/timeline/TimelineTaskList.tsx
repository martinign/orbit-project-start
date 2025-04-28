
import React from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  start_date?: string;
  due_date?: string;
}

interface TimelineTaskListProps {
  tasks: Task[];
}

export const TimelineTaskList: React.FC<TimelineTaskListProps> = ({ tasks }) => {
  return (
    <div className="w-64 border-r bg-gray-100 overflow-auto">
      <div className="sticky top-0 z-10 h-[82px] bg-gray-100 border-b flex items-end">
        <div className="h-[42px] w-full bg-gray-200/50 border-b font-medium px-4 flex items-center">
          Tasks
        </div>
      </div>
      <div>
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="h-8 border-b px-4 truncate flex items-center text-sm"
            title={task.title}
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
};
