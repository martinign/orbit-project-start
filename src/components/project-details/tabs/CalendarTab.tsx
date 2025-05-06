
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
      
      <div className="h-[calc(100vh-230px)]">
        <ProjectCalendar 
          projectId={projectId} 
          searchQuery="" 
          setSearchQuery={() => {}} 
        />
      </div>
    </div>
  );
}
