
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkdayCodeForm, { CodeFormData } from './workday-codes/WorkdayCodeForm';
import WorkdayCodesTable from './workday-codes/WorkdayCodesTable';
import AddProjectDialog from './workday-codes/AddProjectDialog';
import DeleteCodeDialog from './workday-codes/DeleteCodeDialog';
import { 
  WorkdayCode, Project, ProjectAssociations,
  fetchWorkdayCodes, fetchProjects, fetchProjectAssociations,
  saveWorkdayCode, associateProjectWithCode, removeProjectAssociation, deleteWorkdayCode
} from '@/utils/workdayCodeUtils';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface WorkdayCodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  code?: any;
}

const WorkdayCodeDialog: React.FC<WorkdayCodeDialogProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  code 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workdayCodes, setWorkdayCodes] = useState<WorkdayCode[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<WorkdayCode | null>(null);
  const [projectAssociations, setProjectAssociations] = useState<ProjectAssociations>({});
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  
  const isEditing = !!code;

  // Subscribe to real-time changes in workday_codes and project_workday_codes tables
  useRealtimeSubscription({
    table: 'workday_codes' as any,
    event: '*',
    onRecordChange: () => {
      loadWorkdayCodes();
    }
  });
  
  useRealtimeSubscription({
    table: 'project_workday_codes' as any,
    event: '*',
    onRecordChange: () => {
      loadWorkdayCodes();
    }
  });

  const loadWorkdayCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchWorkdayCodes();
      if (error) throw error;
      setWorkdayCodes(data);
      
      // Fetch project associations
      const { associations, error: assocError } = await fetchProjectAssociations();
      if (assocError) throw assocError;
      setProjectAssociations(associations);
    } catch (error) {
      console.error("Error loading workday codes:", error);
      toast({
        title: "Error",
        description: "Failed to load workday codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const { data, error } = await fetchProjects();
      if (error) throw error;
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setProjectsLoading(false);
    }
  };

  // Initial fetch when dialog opens
  useEffect(() => {
    if (open) {
      loadWorkdayCodes();
      loadProjects();
    }
  }, [open]);

  const handleSubmit = async (data: CodeFormData) => {
    if (!user?.id) return;

    const result = await saveWorkdayCode({
      task: data.task,
      activity: data.activity,
      projectId: data.projectId
    }, user.id, isEditing ? code.id : undefined);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      
      if (isEditing) {
        onSuccess(); // Close dialog on edit
      } else {
        // Reset form but don't close dialog on create
        loadWorkdayCodes();
      }
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (codeToEdit: WorkdayCode) => {
    onSuccess(); // Close this dialog
    // Re-open with the code to edit
    setTimeout(() => {
      onClose();
      onSuccess();
    }, 100);
  };
  
  const confirmDelete = (codeToDelete: WorkdayCode) => {
    setCodeToDelete(codeToDelete);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!codeToDelete) return;
    
    const result = await deleteWorkdayCode(codeToDelete.id);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      
      loadWorkdayCodes();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    
    setDeleteDialogOpen(false);
    setCodeToDelete(null);
  };

  const handleOpenAddProjectDialog = (codeId: string) => {
    setSelectedCodeId(codeId);
    setAddProjectDialogOpen(true);
  };

  const handleAddProject = async (projectId: string) => {
    if (!selectedCodeId || !user?.id || !projectId) return;
    
    const result = await associateProjectWithCode(selectedCodeId, projectId, user.id);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      
      setAddProjectDialogOpen(false);
      loadWorkdayCodes();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveProject = async (codeId: string, projectId: string) => {
    const result = await removeProjectAssociation(codeId, projectId);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      
      // Update the local state
      const newAssociations = { ...projectAssociations };
      if (newAssociations[codeId]) {
        newAssociations[codeId] = newAssociations[codeId].filter(
          project => project.id !== projectId
        );
        setProjectAssociations(newAssociations);
      }
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const defaultValues = isEditing ? {
    task: code.task,
    activity: code.activity,
    projectId: ""
  } : { task: '', activity: '', projectId: "" };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workday Code' : 'Create New Workday Code'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          <WorkdayCodeForm 
            defaultValues={defaultValues}
            projects={projects}
            isEditing={isEditing}
            onSubmit={handleSubmit}
            onCancel={onClose}
            projectsLoading={projectsLoading}
          />

          <WorkdayCodesTable 
            workdayCodes={workdayCodes}
            projectAssociations={projectAssociations}
            loading={loading}
            userId={user?.id}
            onRefresh={() => {
              loadWorkdayCodes();
              loadProjects();
            }}
            onEdit={handleEdit}
            onDelete={confirmDelete}
            onAddProject={handleOpenAddProjectDialog}
            onRemoveProject={handleRemoveProject}
          />
        </div>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <DeleteCodeDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        codeToDelete={codeToDelete}
        onConfirm={handleDelete}
      />
      
      {/* Add Project Dialog */}
      <AddProjectDialog 
        open={addProjectDialogOpen}
        onOpenChange={setAddProjectDialogOpen}
        projects={projects}
        onAddProject={handleAddProject}
      />
    </Dialog>
  );
};

export default WorkdayCodeDialog;
