
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface TeamMember {
  id: string;
  full_name: string;
  last_name?: string;
  display_name?: string;
}

interface CalendarHeaderProps {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  teamMembers: TeamMember[];
}

export function CalendarHeader({
  selectedUserId,
  setSelectedUserId,
  teamMembers
}: CalendarHeaderProps) {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 text-sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedUserId ? 
              teamMembers.find(m => m.id === selectedUserId)?.display_name || 'All Events' 
              : 'All Events'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setSelectedUserId(null)}>
            All Events
          </DropdownMenuItem>
          {teamMembers.map((member) => (
            <DropdownMenuItem
              key={member.id}
              onClick={() => setSelectedUserId(member.id)}
            >
              {member.display_name || `${member.full_name}`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
