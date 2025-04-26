
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GanttTask } from '@/types/gantt';

interface UseGanttTaskFormProps {
  projectId: string;
  task?: GanttTask;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  onClose: () => void;
}

export const useGanttTaskForm = ({ 
  projectId, 
  task, 
  mode = 'create', 
  onSuccess, 
  onClose 
}: UseGanttTaskFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [status, setStatus] = useState('not started');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'not started');
      setAssignedTo(task.assigned_to || null);
      
      if (task.start_date) {
        setStartDate(new Date(task.start_date));
      }
      
      setDurationDays(task.duration_days || 1);
      
      if (task.dependencies) {
        setDependencies(Array.isArray(task.dependencies) ? task.dependencies : []);
      }
    }
  }, [task, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the title",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveStartDate = dependencies.length > 0 ? null : startDate;
      
      if (!effectiveStartDate && !dependencies.length) {
        throw new Error("Start date is required when there are no dependencies");
      }

      if (mode === 'create') {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        const { data: taskResult, error: taskError } = await supabase
          .from('project_tasks')
          .insert({
            title,
            description,
            status,
            project_id: projectId,
            assigned_to: assignedTo,
            is_gantt_task: true,
            user_id: userId,
            start_date: effectiveStartDate?.toISOString(),
            duration_days: durationDays
          })
          .select('id')
          .single();

        if (taskError) throw taskError;

        const { error: ganttError } = await supabase
          .from('gantt_tasks')
          .insert({
            task_id: taskResult.id,
            project_id: projectId,
            start_date: effectiveStartDate?.toISOString(),
            duration_days: durationDays,
            dependencies: dependencies.length > 0 ? dependencies : null
          });

        if (ganttError) throw ganttError;
      } else if (task?.id) {
        const { error: taskError } = await supabase
          .from('project_tasks')
          .update({
            title,
            description,
            status,
            assigned_to: assignedTo,
            start_date: effectiveStartDate?.toISOString(),
            duration_days: durationDays
          })
          .eq('id', task.id);

        if (taskError) throw taskError;

        const { error: ganttError } = await supabase
          .from('gantt_tasks')
          .update({
            start_date: effectiveStartDate?.toISOString(),
            duration_days: durationDays,
            dependencies: dependencies.length > 0 ? dependencies : null
          })
          .eq('task_id', task.id)
          .eq('project_id', projectId);

        if (ganttError) throw ganttError;
      }

      queryClient.invalidateQueries({ queryKey: ['gantt_tasks', projectId] });
      
      toast({
        title: "Success",
        description: mode === 'create' ? "Gantt task created successfully" : "Gantt task updated successfully",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving gantt task:', error);
      toast({
        title: "Error",
        description: "Failed to save the gantt task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
      title,
      description,
      startDate,
      durationDays,
      status,
      assignedTo,
      dependencies,
      calendarOpen,
      isSubmitting
    },
    setTitle,
    setDescription,
    setStartDate,
    setDurationDays,
    setStatus,
    setAssignedTo,
    setDependencies,
    setCalendarOpen,
    handleSubmit
  };
};
