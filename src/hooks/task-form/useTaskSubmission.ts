
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

  const submitTask = async (taskData: any) => {
    setIsSubmitting(true);
    
    try {
      console.log("Saving task with data:", taskData);
      
      if (mode === 'edit' && taskId) {
        const { error } = await supabase
          .from('project_tasks')
          .update({
            ...taskData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('project_tasks')
          .insert(taskData);
          
        if (error) throw error;
        
        // Explicitly invalidate the new tasks count query
        queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
        
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }

      // Use setTimeout to ensure state updates complete before closing
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      }, 100);
      
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitTask
  };
};
