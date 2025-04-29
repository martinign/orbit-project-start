
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskMemberFilter } from './TaskMemberFilter';
import { TasksTable } from './TasksTable';

interface TasksListContentProps {
  tasks: any[];
  users: any[];
  selectedMemberId: string | null;
  onMemberSelect: (memberId: string | null) => void;
  onCreateTask: () => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (task: any) => void;
  onTaskUpdates: (task: any) => void;
  showProject: boolean;
}

export const TasksListContent: React.FC<TasksListContentProps> = ({
  tasks,
  users,
  selectedMemberId,
  onMemberSelect,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onTaskUpdates,
  showProject
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TaskMemberFilter
          users={users}
          selectedMemberId={selectedMemberId}
          onMemberSelect={onMemberSelect}
        />
        <Button onClick={onCreateTask} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      <TasksTable
        tasks={tasks}
        showProject={showProject}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onTaskUpdates={onTaskUpdates}
      />
    </div>
  );
};
