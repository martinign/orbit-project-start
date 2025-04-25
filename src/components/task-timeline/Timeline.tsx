import React from 'react';
import { format } from 'date-fns';
import { CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimelineTaskBar } from './TimelineTaskBar';
import { Task, TeamMember } from '../TaskTimelineView';

interface TimelineProps {
  tasks: Task[];
  timelineDates: Date[];
  teamMembers: TeamMember[];
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tasks,
  timelineDates,
  teamMembers,
  hasFilters,
  onClearFilters,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <CircleDashed className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tasks found with the current filters.</p>
        {hasFilters && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onClearFilters}
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-400px)]">
      <div className="min-w-[800px]">
        <div className="flex">
          <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-gray-200 bg-gray-50 font-medium">
            Task Title
          </div>
          
          <div 
            className="flex-1 grid gap-0 border-b" 
            style={{ gridTemplateColumns: `repeat(${timelineDates.length}, minmax(30px, 1fr))` }}
          >
            {timelineDates.map((date, index) => (
              <div 
                key={index} 
                className={`text-center py-1 px-1 text-xs ${
                  date.getDate() === 1 || index === 0 ? 'font-bold' : ''
                }`}
              >
                {date.getDate() === 1 || index === 0 
                  ? format(date, 'MMM d')
                  : format(date, 'd')}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <TimelineTaskBar 
              key={task.id}
              task={task}
              timelineDates={timelineDates}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
