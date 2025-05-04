
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubtaskForm } from './subtasks/SubtaskForm';
import { useSubtaskForm } from '@/hooks/useSubtaskForm';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface Task {
  id: string;
  title: string;
  project_id: string; // Added project_id property to match the interface in useSubtaskForm
}

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

interface SubtaskDialogProps {
  open: boolean;
  onClose: () => void;
  parentTask: Task | null;
  subtask?: Subtask;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

const SubtaskDialog: React.FC<SubtaskDialogProps> = ({
  open,
  onClose,
  parentTask,
  subtask,
  mode = 'create',
  onSuccess
}) => {
  const formProps = useSubtaskForm(parentTask, subtask, mode, onSuccess);
  
  // Use the project_id from parentTask to filter team members
  const { data: teamMembers, isLoading } = useTeamMembers(parentTask?.project_id);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Subtask' : 'Create Subtask'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? `Edit subtask for: ${parentTask?.title}`
              : `Create a subtask for: ${parentTask?.title}`}
          </DialogDescription>
        </DialogHeader>

        <SubtaskForm
          {...formProps}
          teamMembers={teamMembers || []}
          workdayCodes={formProps.workdayCodes}
          selectedWorkdayCode={formProps.selectedWorkdayCode}
          setSelectedWorkdayCode={formProps.setSelectedWorkdayCode}
          onSubmit={formProps.handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubtaskDialog;
