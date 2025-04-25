
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
  const {
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    dueDate,
    setDueDate,
    notes,
    setNotes,
    assignedTo,
    setAssignedTo,
    isSubmitting,
    handleSubmit,
  } = useSubtaskForm(parentTask, subtask, mode, onSuccess);

  const { data: teamMembers } = useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('id, full_name, last_name');
  
      if (error) throw error;
  
      return data.map(member => ({
        ...member,
        full_name: `${member.full_name} ${member.last_name}`,
      })).sort((a, b) => a.full_name.localeCompare(b.full_name));
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
          title={title}
          description={description}
          status={status}
          dueDate={dueDate}
          notes={notes}
          assignedTo={assignedTo}
          isSubmitting={isSubmitting}
          setTitle={setTitle}
          setDescription={setDescription}
          setStatus={setStatus}
          setDueDate={setDueDate}
          setNotes={setNotes}
          setAssignedTo={setAssignedTo}
          teamMembers={teamMembers}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubtaskDialog;
