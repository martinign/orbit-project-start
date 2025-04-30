
import React from 'react';
import { ListTodo } from 'lucide-react';
import { StatisticCard } from './StatisticCard';

interface TaskStatisticCardProps {
  tasksStats: {
    total: number;
    completed: number;
    inProgress: number;
  };
  newItemsCount?: number;
  onTabChange: () => void;
}

export const TaskStatisticCard: React.FC<TaskStatisticCardProps> = ({
  tasksStats,
  newItemsCount,
  onTabChange,
}) => {
  return (
    <StatisticCard
      title="Tasks"
      value={tasksStats.total}
      icon={<ListTodo className="h-8 w-8" />}
      iconColor="text-green-500"
      onClick={onTabChange}
      newItemsCount={newItemsCount}
      extraContent={
        <div className="flex gap-2 mt-1 text-xs">
          <span className="text-green-600">
            {tasksStats.completed} Completed
          </span>
          <span className="text-blue-600">
            {tasksStats.inProgress} In Progress
          </span>
        </div>
      }
    />
  );
};
