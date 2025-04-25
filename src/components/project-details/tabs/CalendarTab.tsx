
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProjectCalendar } from '@/components/project-calendar/ProjectCalendar';

interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Calendar</CardTitle>
        <CardDescription>View and manage project events</CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectCalendar projectId={projectId} />
      </CardContent>
    </Card>
  );
};
