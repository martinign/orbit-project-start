
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  full_name: string;
  last_name: string;
  role: string;
}

interface TaskMemberFilterProps {
  users: User[];
  selectedMemberId: string | null;
  onMemberSelect: (memberId: string | null) => void;
}

export const TaskMemberFilter: React.FC<TaskMemberFilterProps> = ({
  users,
  selectedMemberId,
  onMemberSelect,
}) => {
  const selectedUser = users.find(u => u.id === selectedMemberId);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px]">
          <Users className="mr-2 h-4 w-4" />
          {selectedMemberId ? 
            selectedUser ? `${selectedUser.full_name}` : 'All Members' 
            : 'All Members'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onMemberSelect(null)}>
          All Members
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => onMemberSelect(user.id)}
          >
            {`${user.full_name}`} ({user.role})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
