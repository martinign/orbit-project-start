
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createStorageFilePath } from '@/utils/file-utils';

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
      console.log("Saving task with data:", taskData);
      
      // Extract file from taskData
      const fileToUpload = taskData.fileAttachment;
      let fileData = {};
      
      // If there's a file to upload, handle the file upload first
      if (fileToUpload) {
        const userId = taskData.user_id;
        if (!userId) throw new Error("User ID is required for file uploads");
        
        // Create a unique path for the file
        const filePath = createStorageFilePath(userId, fileToUpload.name);
        
        // Upload the file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, fileToUpload);
        
        if (uploadError) throw uploadError;
        
        // Add file data to the task
        fileData = {
          file_path: filePath,
          file_name: fileToUpload.name,
          file_type: fileToUpload.type,
          file_size: fileToUpload.size
        };
        
        console.log("File uploaded successfully:", fileData);
      }
      
      // Remove the actual file object as it can't be stored in the database
      const { fileAttachment, ...taskDataWithoutFile } = taskData;
      
      if (mode === 'edit' && taskId) {
        console.time('taskUpdate');
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({
            ...taskDataWithoutFile,
            ...fileData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);
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
        const { error: createError } = await supabase
          .from('project_tasks')
          .insert({
            ...taskDataWithoutFile,
            ...fileData
          });
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
