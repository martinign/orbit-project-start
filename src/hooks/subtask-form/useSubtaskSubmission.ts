
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Subtask {
  id?: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  parent_task_id: string;
  notes?: string;
  assigned_to?: string;
  workday_code_id?: string;
}

export const useSubtaskSubmission = ({
  mode,
  subtaskId,
  onSuccess
}: {
  mode: 'create' | 'edit';
  subtaskId?: string;
  onSuccess?: () => void;
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert empty strings and 'none' to null for UUID fields
  const convertToNullIfEmpty = (value: string | null | undefined): string | null => {
    if (!value || value === 'none' || value.trim() === '') {
      return null;
    }
    return value;
  };

  const submitSubtask = async (subtaskData: any) => {
    setIsSubmitting(true);
    console.time('subtaskSubmission');
    
    try {
      // Process the data to ensure correct formats for database
      const processedData = {
        ...subtaskData,
        assigned_to: convertToNullIfEmpty(subtaskData.assigned_to),
        workday_code_id: convertToNullIfEmpty(subtaskData.workday_code_id)
      };
      
      if (mode === 'edit' && subtaskId) {
        const { error } = await supabase
          .from('project_subtasks')
          .update(processedData)
          .eq('id', subtaskId);
            
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Subtask updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('project_subtasks')
          .insert(processedData);
            
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Subtask created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error("Error saving subtask:", error);
      toast({
        title: "Error",
        description: "Failed to save subtask. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      console.timeEnd('subtaskSubmission');
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSubtask
  };
};
