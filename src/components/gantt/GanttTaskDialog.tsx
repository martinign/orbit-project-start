
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { GanttTask } from '@/types/gantt';
import { useGanttTaskDependencies } from '@/hooks/useGanttTaskDependencies';
import { GanttTaskForm } from './GanttTaskForm';
import { GanttTaskDependencies } from './GanttTaskDependencies';

interface GanttTaskDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task?: GanttTask;
  mode?: 'create' | 'edit';
}

const GanttTaskDialog: React.FC<GanttTaskDialogProps> = ({
  projectId,
  open,
  onClose,
  onSuccess,
  task,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: teamMembers } = useTeamMembers();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [status, setStatus] = useState('not started');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { 
    availableTasks, 
    selectedDependency, 
    setSelectedDependency,
    dependencyEndDate 
  } = useGanttTaskDependencies(projectId, task?.id, dependencies);

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
    } else {
      setTitle('');
      setDescription('');
      setStartDate(null);
      setDurationDays(1);
      setStatus('not started');
      setAssignedTo(null);
      setDependencies([]);
    }
  }, [task, mode, open]);

  const handleAddDependency = () => {
    if (selectedDependency && !dependencies.includes(selectedDependency)) {
      setDependencies([...dependencies, selectedDependency]);
      setSelectedDependency(null);
    }
  };

  const handleRemoveDependency = (depId: string) => {
    setDependencies(dependencies.filter(id => id !== depId));
  };

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
      const effectiveStartDate = dependencies.length > 0 ? dependencyEndDate : startDate;
      
      if (!effectiveStartDate && !dependencies.length) {
        throw new Error("Start date is required when there are no dependencies");
      }

      if (mode === 'create') {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Create the task first
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

        // Then create the Gantt task with dependencies
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
        // Update the main task
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

        // Update the Gantt task
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Gantt Task' : 'Edit Gantt Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new task to the Gantt chart timeline' 
              : 'Update the existing Gantt task details'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <GanttTaskForm
            title={title}
            description={description}
            startDate={startDate}
            durationDays={durationDays}
            status={status}
            assignedTo={assignedTo}
            dependencies={dependencies}
            dependencyEndDate={dependencyEndDate}
            teamMembers={teamMembers || []}
            calendarOpen={calendarOpen}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onStartDateSelect={setStartDate}
            onDurationChange={(value) => setDurationDays(parseInt(value) || 1)}
            onStatusChange={setStatus}
            onAssignedToChange={setAssignedTo}
            setCalendarOpen={setCalendarOpen}
          />

          <GanttTaskDependencies
            availableTasks={availableTasks}
            dependencies={dependencies}
            selectedDependency={selectedDependency}
            dependencyEndDate={dependencyEndDate}
            onSelectedDependencyChange={setSelectedDependency}
            onAddDependency={handleAddDependency}
            onRemoveDependency={handleRemoveDependency}
          />

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GanttTaskDialog;
