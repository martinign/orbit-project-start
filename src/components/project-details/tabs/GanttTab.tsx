
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GanttChart } from '@/components/gantt/GanttChart';
import { GanttTask } from '@/types/gantt';

interface GanttTabProps {
  projectId: string;
}

export const GanttTab: React.FC<GanttTabProps> = ({ projectId }) => {
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['gantt_tasks', projectId],
    queryFn: async () => {
      // First fetch the project tasks that are marked as Gantt tasks
      const { data: taskData, error: taskError } = await supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          description,
          status,
          project_id,
          user_id,
          assigned_to,
          is_gantt_task,
          created_at,
          updated_at
        `)
        .eq('project_id', projectId)
        .eq('is_gantt_task', true)
        .order('created_at', { ascending: true });

      if (taskError) throw taskError;

      if (taskData && taskData.length > 0) {
        // Then fetch the Gantt-specific data for these tasks
        const taskIds = taskData.map(task => task.id);
        
        const { data: ganttData, error: ganttError } = await supabase
          .from('gantt_tasks')
          .select('*')
          .in('task_id', taskIds);

        if (ganttError) throw ganttError;

        // Merge the data
        const mergedTasks: GanttTask[] = taskData.map(task => {
          const ganttInfo = ganttData?.find(g => g.task_id === task.id);
          return { 
            ...task,
            start_date: ganttInfo?.start_date,
            duration_days: ganttInfo?.duration_days,
            dependencies: ganttInfo?.dependencies || []
          } as GanttTask;
        });

        return mergedTasks;
      }

      return [] as GanttTask[];
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
        <GanttChart tasks={tasks || []} projectId={projectId} onRefetch={() => refetch()} />
      </CardContent>
    </Card>
  );
};
