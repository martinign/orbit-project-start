
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProjectCalendar } from '@/components/project-calendar/ProjectCalendar';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ projectId }) => {
  const queryClient = useQueryClient();

  // This is a backup subscription at the tab level to ensure we get events updates
  // even when the component is first mounted
  useEffect(() => {
    const channel = supabase.channel(`calendar_tab_events_${projectId}`)
      .on('postgres_changes', {
        event: '*', // Listen for all events: INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'project_events',
        filter: `project_id=eq.${projectId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
        queryClient.invalidateQueries({ queryKey: ['project_events_count', projectId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

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
