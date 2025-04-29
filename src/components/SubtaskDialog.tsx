
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubtaskForm } from './subtasks/SubtaskForm';
import { useSubtaskForm } from '@/hooks/useSubtaskForm';

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

  const { data: teamMembers } = useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('id, full_name, last_name');
  
      if (error) throw error;
  
      return data.map(member => ({
        ...member,
        // Don't concatenate full_name with last_name again
        display_name: member.full_name,
      })).sort((a, b) => a.display_name.localeCompare(b.display_name));
    },
  });

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
          teamMembers={teamMembers}
          onSubmit={formProps.handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubtaskDialog;
