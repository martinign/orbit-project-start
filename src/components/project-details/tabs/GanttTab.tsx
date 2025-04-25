
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GanttChart } from '@/components/gantt/GanttChart';

interface GanttTabProps {
  projectId: string;
}

export const GanttTab: React.FC<GanttTabProps> = ({ projectId }) => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['gantt_tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_gantt_task', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-6">Loading Gantt chart...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
        <CardDescription>View and manage project tasks in a Gantt chart</CardDescription>
      </CardHeader>
      <CardContent>
        <GanttChart tasks={tasks || []} />
      </CardContent>
    </Card>
  );
};
