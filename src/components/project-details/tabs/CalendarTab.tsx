
import React from 'react';
import { ProjectCalendar } from '@/components/project-calendar/ProjectCalendar';

interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ projectId }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Project Calendar</h2>
        <p className="text-muted-foreground">View and manage project events</p>
      </div>
      
      <div className="flex-1">
        <ProjectCalendar 
          projectId={projectId} 
          searchQuery="" 
          setSearchQuery={() => {}} 
        />
      </div>
    </div>
  );
}
