
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useTaskForm } from '@/hooks/task-form/useTaskForm';
import { TaskForm } from './TaskForm';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import TaskTemplatesListDialog from '../TaskTemplatesListDialog';
import { useToast } from '@/hooks/use-toast';

interface TaskTemplate {
  id: string;
  title: string;
  description: string | null;
}

interface SOPTemplate {
  id: string;
  title: string;
  sop_id: string | null;
  sop_link: string | null;
}

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  task?: any; // For editing existing tasks
  projectId?: string;
  onSuccess?: () => void;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ 
  open, 
  onClose, 
  mode = 'create', 
  task, 
  projectId, 
  onSuccess 
}) => {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { toast } = useToast();
  
  // Pass the projectId to useTeamMembers to filter by project
  const { data: teamMembers, isLoading: isLoadingTeamMembers } = useTeamMembers(projectId);
  
  const taskForm = useTaskForm(mode, task, projectId, onSuccess, onClose);
  
  // Improved dialog close handling
  const handleClose = () => {
    if (taskForm.isSubmitting) {
      return; // Prevent closing while submitting
    }
    
    setIsClosing(true);
    // Add slight delay to allow animations
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 100);
  };

  const handleTemplateSelect = (template: TaskTemplate | SOPTemplate, templateType: 'task' | 'sop') => {
    console.log(`Applying ${templateType} template to form:`, template);
    
    // Common field (title exists in both template types)
    taskForm.setTitle(template.title || '');
    
    // For regular task templates
    if (templateType === 'task' && 'description' in template) {
      if (template.description) {
        taskForm.setDescription(template.description);
      }
    } 
    // For SOP templates - add additional info to description
    else if (templateType === 'sop') {
      let descriptionContent = '';
      
      if ('description' in template && template.description) {
        descriptionContent = template.description;
      }
      
      // Add SOP ID and link to description if they exist
      if ('sop_id' in template && template.sop_id) {
        descriptionContent += `\n\nSOP ID: ${template.sop_id}`;
      }
      
      if ('sop_link' in template && template.sop_link) {
        descriptionContent += `\n\nSOP Link: ${template.sop_link}`;
      }
      
      if (descriptionContent) {
        taskForm.setDescription(descriptionContent.trim());
      }
      
      // Show notification that SOP template was applied
      toast({
        title: "SOP Template Applied",
        description: `Applied SOP template: ${template.title}`,
        variant: "default",
      });
    } else {
      // Regular task template
      toast({
        title: "Template Applied",
        description: `Applied template: ${template.title}`,
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={taskForm.isSubmitting ? undefined : handleClose}>
        <DialogContent className={isClosing ? 'pointer-events-none opacity-70' : ''}>
          <DialogHeader>
            <DialogTitle>{mode === 'edit' ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {mode === 'edit' 
                ? 'Make changes to your task here.' 
                : 'Fill out the form to create a new task.'}
            </DialogDescription>
          </DialogHeader>
          
          <TaskForm
            title={taskForm.title}
            setTitle={taskForm.setTitle}
            description={taskForm.description}
            setDescription={taskForm.setDescription}
            status={taskForm.status}
            setStatus={taskForm.setStatus}
            priority={taskForm.priority}
            setPriority={taskForm.setPriority}
            selectedProject={taskForm.selectedProject}
            setSelectedProject={taskForm.setSelectedProject}
            dueDate={taskForm.dueDate}
            setDueDate={taskForm.setDueDate}
            notes={taskForm.notes}
            setNotes={taskForm.setNotes}
            assignedTo={taskForm.assignedTo}
            setAssignedTo={taskForm.setAssignedTo}
            selectedWorkdayCode={taskForm.selectedWorkdayCode}
            setSelectedWorkdayCode={taskForm.setSelectedWorkdayCode}
            isPrivate={taskForm.isPrivate}
            setIsPrivate={taskForm.setIsPrivate}
            teamMembers={teamMembers}
            projects={taskForm.projects}
            workdayCodes={taskForm.workdayCodes}
            hasFixedProject={!!projectId}
            isSubmitting={taskForm.isSubmitting}
            onSubmit={taskForm.handleSubmit}
            onClose={handleClose}
            onOpenTemplateDialog={() => setIsTemplateDialogOpen(true)}
            mode={mode}
          />
        </DialogContent>
      </Dialog>

      <TaskTemplatesListDialog
        open={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        selectionMode={true}
        onTemplateSelect={handleTemplateSelect}
      />
    </>
  );
};

export default TaskDialog;
