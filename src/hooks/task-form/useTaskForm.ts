
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Import the modular hooks
import { useTaskFormState } from './useTaskFormState';
import { useProjectSelect } from './useProjectSelect';
import { useWorkdayCodes } from './useWorkdayCodes';
import { useTaskSubmission } from './useTaskSubmission';

export const useTaskForm = (
  mode: 'create' | 'edit',
  task?: any, 
  projectId?: string,
  onSuccess?: () => void,
  onClose?: () => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use modular hooks
  const formState = useTaskFormState({ 
    task, 
    mode, 
    initialStatus: task?.status 
  });
  
  const projectSelect = useProjectSelect(projectId || task?.project_id);
  
  const workdayCodes = useWorkdayCodes(
    projectSelect.selectedProject,
    task?.project_id,
    task?.workday_code_id
  );
  
  const submission = useTaskSubmission({ 
    mode, 
    taskId: task?.id, 
    onSuccess, 
    onClose 
  });

  // Initialize projects if needed
  useEffect(() => {
    if (!projectId && !formState.didInitialFormSet) {
      projectSelect.fetchProjects();
    }
  }, [projectId, formState.didInitialFormSet]);

  // Listen for project selection changes and update workday codes accordingly
  useEffect(() => {
    if (projectSelect.selectedProject && projectSelect.selectedProject !== projectId) {
      workdayCodes.loadWorkdayCodes(projectSelect.selectedProject);
    }
  }, [projectSelect.selectedProject, projectId]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectSelect.selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save tasks",
        variant: "destructive",
      });
      return;
    }
    
    const taskData = {
      title: formState.title,
      description: formState.description,
      status: formState.status,
      priority: formState.priority,
      project_id: projectSelect.selectedProject,
      notes: formState.notes,
      due_date: formState.dueDate ? formState.dueDate.toISOString() : null,
      assigned_to: formState.assignedTo === 'none' ? null : formState.assignedTo,
      user_id: user.id,
      workday_code_id: workdayCodes.selectedWorkdayCode === 'none' ? null : workdayCodes.selectedWorkdayCode,
      is_private: formState.isPrivate,
      fileAttachment: formState.fileAttachment
    };
    
    await submission.submitTask(taskData);
  };

  return {
    // Form state
    ...formState,
    // Project selection
    selectedProject: projectSelect.selectedProject,
    setSelectedProject: projectSelect.setSelectedProject,
    projects: projectSelect.projects,
    // Workday codes
    workdayCodes: workdayCodes.workdayCodes,
    selectedWorkdayCode: workdayCodes.selectedWorkdayCode,
    setSelectedWorkdayCode: workdayCodes.setSelectedWorkdayCode,
    // Form submission
    isSubmitting: submission.isSubmitting,
    handleSubmit,
  };
};
