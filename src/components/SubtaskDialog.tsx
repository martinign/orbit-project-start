
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
  
  // Use the updated useTeamMembers hook that only returns authenticated users
  const { data: teamMembers, isLoading } = useTeamMembers();
  
  // Process team members to include display_name property
  const processedTeamMembers = React.useMemo(() => {
    return teamMembers?.map(member => ({
      ...member,
      display_name: member.full_name
    })) || [];
  }, [teamMembers]);

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
          teamMembers={processedTeamMembers}
          onSubmit={formProps.handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubtaskDialog;
