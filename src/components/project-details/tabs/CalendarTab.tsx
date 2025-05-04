
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProjectCalendar } from '@/components/project-calendar/ProjectCalendar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Project Calendar</CardTitle>
        </div>
        <CardDescription>View and manage project events</CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectCalendar projectId={projectId} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </CardContent>
    </Card>
  );
};
