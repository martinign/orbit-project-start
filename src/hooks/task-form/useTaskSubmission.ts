
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
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Clean the taskData object to remove undefined and null values
      const cleanedData = Object.fromEntries(
        Object.entries(taskData).filter(([_, v]) => v !== undefined)
      );
      
      console.log(`${mode === 'edit' ? 'Updating' : 'Creating'} task with data:`, cleanedData);
      
      if (mode === 'edit' && taskId) {
        console.time('taskUpdate');
        console.log('Task ID for update:', taskId);
        
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({
            ...cleanedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);
        console.timeEnd('taskUpdate');
          
        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        
        console.log('Task updated successfully');
        
        // Invalidate queries after successful update
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        console.time('taskCreate');
        const { error: createError } = await supabase
          .from('project_tasks')
          .insert(cleanedData);
        console.timeEnd('taskCreate');
          
        if (createError) {
          console.error('Create error:', createError);
          throw createError;
        }
        
        console.log('Task created successfully');
        
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
        description: "Failed to save task. Please try again.",
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
