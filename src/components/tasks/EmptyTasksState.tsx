
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskMemberFilter } from './TaskMemberFilter';

interface EmptyTasksStateProps {
  users: any[];
  selectedMemberId: string | null;
  onMemberSelect: (memberId: string | null) => void;
  searchTerm?: string;
  onCreateTask: () => void;
}

export const EmptyTasksState: React.FC<EmptyTasksStateProps> = ({
  users,
  selectedMemberId,
  onMemberSelect,
  searchTerm = '',
  onCreateTask
}) => {
  return (
    <div className="text-center p-8 border rounded-lg">
      <div className="mb-4 flex justify-center">
        <TaskMemberFilter
          users={users}
          selectedMemberId={selectedMemberId}
          onMemberSelect={onMemberSelect}
        />
      </div>
      <p className="text-muted-foreground mb-4">
        {searchTerm
          ? 'No tasks match your search criteria'
          : 'No tasks found for this project'}
      </p>
      <Button onClick={onCreateTask} className="bg-blue-500 hover:bg-blue-600">
        <Plus className="mr-2 h-4 w-4" /> Create Task
      </Button>
    </div>
  );
};
