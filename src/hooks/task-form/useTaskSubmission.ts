
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskSubmissionProps {
  mode: 'create' | 'edit';
  taskId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const useTaskSubmission = ({ 
  mode, 
  taskId, 
  onSuccess, 
  onClose 
}: TaskSubmissionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTask = async (taskData: any) => {
    console.time('taskSubmission');
    console.log(`Starting task submission in ${mode} mode`, { taskData, taskId });
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Saving task with data:", taskData);
      
      if (mode === 'edit' && taskId) {
        console.time('taskUpdate');
        console.log(`Updating task with ID: ${taskId}`);
        
        // Remove any undefined or null values that might cause issues
        const cleanedData = Object.fromEntries(
          Object.entries(taskData).filter(([_, v]) => v !== undefined)
        );
        
        const { error: updateError, data } = await supabase
          .from('project_tasks')
          .update({
            ...cleanedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId)
          .select();
        
        console.log("Update response:", { error: updateError, data });
        console.timeEnd('taskUpdate');
          
        if (updateError) throw updateError;
        
        // Invalidate queries after successful update
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        console.time('taskCreate');
        const { error: createError, data } = await supabase
          .from('project_tasks')
          .insert(taskData)
          .select();
        
        console.log("Create response:", { error: createError, data });
        console.timeEnd('taskCreate');
          
        if (createError) throw createError;
        
        // Explicitly invalidate the new tasks count query
        await queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }

      // Call success callback first
      if (onSuccess) {
        onSuccess();
      }
      
      // Small delay before closing to ensure UI updates properly
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 300);
      
    } catch (error: any) {
      console.error("Error saving task:", error);
      setError(error?.message || "Failed to save task");
      toast({
        title: "Error",
        description: error?.message || "Failed to save task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.timeEnd('taskSubmission');
    }
  };

  return {
    isSubmitting,
    error,
    submitTask
  };
};
