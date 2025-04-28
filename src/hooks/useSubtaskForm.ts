
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

interface Task {
  id: string;
  title: string;
}

export const useSubtaskForm = (
  parentTask: Task | null,
  subtask?: Subtask,
  mode: 'create' | 'edit' = 'create',
  onSuccess?: () => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not started');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && subtask) {
      setTitle(subtask.title || '');
      setDescription(subtask.description || '');
      setStatus(subtask.status || 'not started');
      setNotes(subtask.notes || '');
      
      if (subtask.assigned_to) {
        setAssignedTo(subtask.assigned_to);
      } else {
        setAssignedTo('none');
      }
      
      if (subtask.due_date) {
        setDueDate(new Date(subtask.due_date));
      } else {
        setDueDate(undefined);
      }
    } else {
      // Reset form for create mode
      setTitle('');
      setDescription('');
      setStatus('not started');
      setDueDate(undefined);
      setNotes('');
      setAssignedTo('none');
    }
  }, [mode, subtask, parentTask]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    setIsSubmitting(true);
    
    try {
      const subtaskData = {
        title,
        description,
        status,
        parent_task_id: parentTask.id,
        notes,
        due_date: dueDate ? dueDate.toISOString() : null,
        user_id: user.id,
        assigned_to: assignedTo === 'none' ? null : assignedTo
      };
      
      if (mode === 'edit' && subtask?.id) {
        const { error } = await supabase
          .from('project_subtasks')
          .update(subtaskData)
          .eq('id', subtask.id);
            
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Subtask updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('project_subtasks')
          .insert(subtaskData);
            
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Subtask created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving subtask:", error);
      toast({
        title: "Error",
        description: "Failed to save subtask. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
