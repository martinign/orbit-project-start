
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGanttTaskDependencies = (projectId: string, taskId?: string, dependencies: string[] = []) => {
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [selectedDependency, setSelectedDependency] = useState<string | null>(null);
  const [dependencyEndDate, setDependencyEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAvailableTasks = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('project_tasks')
          .select('id, title')
          .eq('project_id', projectId)
          .eq('is_gantt_task', true)
          .order('title', { ascending: true });
        
        if (error) throw error;
        
        const filteredTasks = data?.filter(t => 
          t.id !== taskId && !dependencies.includes(t.id)
        ) || [];
        
        setAvailableTasks(filteredTasks);
      } catch (error) {
        console.error('Error fetching available tasks:', error);
      }
    };

    fetchAvailableTasks();
  }, [projectId, taskId, dependencies]);

  useEffect(() => {
    const calculateLatestDependencyEndDate = async () => {
      if (dependencies.length === 0) {
        setDependencyEndDate(null);
        return;
      }

      try {
        const { data: depTasks } = await supabase
          .from('gantt_tasks')
          .select('task_id, start_date, duration_days')
          .in('task_id', dependencies);

        if (!depTasks?.length) return;

        const latestEnd = depTasks.reduce((latest, dep) => {
          if (!dep.start_date || !dep.duration_days) return latest;
          const endDate = new Date(dep.start_date);
          endDate.setDate(endDate.getDate() + dep.duration_days);
          return endDate > latest ? endDate : latest;
        }, new Date(0));

        setDependencyEndDate(latestEnd);
      } catch (error) {
        console.error('Error calculating dependency end date:', error);
      }
    };

    calculateLatestDependencyEndDate();
  }, [dependencies]);

  return {
    availableTasks,
    selectedDependency,
    setSelectedDependency,
    dependencyEndDate
  };
};
