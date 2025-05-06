
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Project Calendar</h2>
          <p className="text-muted-foreground">View and manage project events</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="h-[calc(100vh-230px)]">
        <ProjectCalendar 
          projectId={projectId} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
      </div>
    </div>
  );
}
