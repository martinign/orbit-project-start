
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
        <CardTitle>Project Calendar</CardTitle>
        <CardDescription>View and manage project events</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ProjectCalendar projectId={projectId} searchQuery={searchQuery} />
      </CardContent>
    </Card>
  );
};
