
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
  user_id?: string; // Add user_id to filter authenticated users
  display_name?: string; // Add display_name property
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
  // Filter to only show authenticated users (those with a user_id)
  const authenticatedUsers = users.filter(user => user.user_id);
  
  const selectedUser = authenticatedUsers.find(u => u.id === selectedMemberId);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px]">
          <Users className="mr-2 h-4 w-4" />
          {selectedMemberId ? 
            selectedUser ? (selectedUser.display_name || `${selectedUser.full_name}`) : 'All Members' 
            : 'All Members'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onMemberSelect(null)}>
          All Members
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {authenticatedUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => onMemberSelect(user.id)}
          >
            {user.display_name || `${user.full_name}`} ({user.role})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
