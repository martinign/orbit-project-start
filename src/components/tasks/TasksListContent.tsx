
import React, { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
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
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  
  // Filter tasks based on private status
  const filteredTasks = showPrivateOnly ? tasks.filter(task => task.is_private) : tasks;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TaskMemberFilter
          users={users}
          selectedMemberId={selectedMemberId}
          onMemberSelect={onMemberSelect}
        />
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowPrivateOnly(!showPrivateOnly)}
            variant={showPrivateOnly ? "default" : "outline"}
            className={showPrivateOnly ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
          >
            <Lock className="mr-1 h-4 w-4" />
            {showPrivateOnly ? 'All Tasks' : 'Private Only'}
          </Button>
          <Button onClick={onCreateTask} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      <TasksTable
        tasks={filteredTasks}
        showProject={showProject}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onTaskUpdates={onTaskUpdates}
      />
    </div>
  );
};
