
import { FormEvent, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubtaskFormState } from './useSubtaskFormState';
import { useWorkdayCodeSelect } from './useWorkdayCodeSelect';
import { useSubtaskSubmission } from './useSubtaskSubmission';

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

interface Task {
  id: string;
  title: string;
  project_id: string;
}

export const useSubtaskForm = (
  parentTask: Task | null,
  subtask?: Subtask,
  mode: 'create' | 'edit' = 'create',
  onSuccess?: () => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use modular hooks for form state management
  const formState = useSubtaskFormState({ 
    subtask, 
    mode 
  });
  
  const workdayCodeSelect = useWorkdayCodeSelect(
    parentTask, 
    subtask?.workday_code_id
  );
  
  const submission = useSubtaskSubmission({
    mode,
    subtaskId: subtask?.id,
    onSuccess
  });

  // Reset state when component unmounts or when dependencies change
  useEffect(() => {
    return () => {
      formState.resetFormState();
    };
  }, [mode, subtask?.id, parentTask?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!parentTask) {
      toast({
        title: "Error",
        description: "Parent task information is missing",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save subtasks",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare subtask data from form state
    const subtaskData = {
      title: formState.title,
      description: formState.description,
      status: formState.status,
      parent_task_id: parentTask.id,
      notes: formState.notes,
      due_date: formState.dueDate ? formState.dueDate.toISOString() : null,
      user_id: user.id,
      assigned_to: formState.assignedTo,
      workday_code_id: workdayCodeSelect.selectedWorkdayCode
    };
    
    await submission.submitSubtask(subtaskData);
  };

  return {
    ...formState,
    workdayCodes: workdayCodeSelect.workdayCodes,
    selectedWorkdayCode: workdayCodeSelect.selectedWorkdayCode,
    setSelectedWorkdayCode: workdayCodeSelect.setSelectedWorkdayCode,
    isSubmitting: submission.isSubmitting,
    handleSubmit
  };
};
