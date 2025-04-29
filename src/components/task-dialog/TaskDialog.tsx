
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useTaskForm } from './useTaskForm';
import { TaskForm } from './TaskForm';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import TaskTemplatesListDialog from '../TaskTemplatesListDialog';
import { useToast } from '@/hooks/use-toast';

interface TaskTemplate {
  id: string;
  title: string;
  description: string | null;
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
  const { toast } = useToast();
  
  // Use the updated useTeamMembers hook that only returns authenticated users
  const { data: teamMembers, isLoading: isLoadingTeamMembers } = useTeamMembers();
  
  const taskForm = useTaskForm(mode, task, projectId, onSuccess, onClose);

  const handleTemplateSelect = (template: TaskTemplate) => {
    console.log("Applying template to form:", template);
    
    taskForm.setTitle(template.title || '');
    if (template.description) {
      taskForm.setDescription(template.description);
    }
    
    toast({
      title: "Template Applied",
      description: `Applied template: ${template.title}`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
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
            teamMembers={teamMembers}
            projects={taskForm.projects}
            hasFixedProject={!!projectId}
            isSubmitting={taskForm.isSubmitting}
            onSubmit={taskForm.handleSubmit}
            onClose={onClose}
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
