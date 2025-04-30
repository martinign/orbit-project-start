
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WorkdayCodeOption, fetchProjectWorkdayCodes } from '@/utils/workdayCombinedUtils';

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
  project_id: string; // Ensure project_id is part of Task interface
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
  const [workdayCodes, setWorkdayCodes] = useState<WorkdayCodeOption[]>([]);
  const [selectedWorkdayCode, setSelectedWorkdayCode] = useState<string>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Fetch workday codes specific to the parent task's project
    const loadWorkdayCodes = async () => {
      console.time('loadWorkdayCodesList');
      
      if (parentTask && parentTask.project_id) {
        const { data } = await fetchProjectWorkdayCodes(parentTask.project_id);
        setWorkdayCodes(data);
        console.log(`Loaded ${data.length} workday codes for project: ${parentTask.project_id}`);
      } else {
        setWorkdayCodes([]);
        console.log('No parent task or project ID available to load workday codes');
      }
      
      console.timeEnd('loadWorkdayCodesList');
    };

    const initializeForm = () => {
      console.time('initializeSubtaskForm');
      
      if (mode === 'edit' && subtask) {
        console.log('Initializing edit subtask form with data:', subtask);
        
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

        if (subtask.workday_code_id) {
          setSelectedWorkdayCode(subtask.workday_code_id);
        } else {
          setSelectedWorkdayCode('none');
        }
      } else {
        // Reset form for create mode
        console.log('Initializing create subtask form with default values');
        setTitle('');
        setDescription('');
        setStatus('not started');
        setDueDate(undefined);
        setNotes('');
        setAssignedTo('none');
        setSelectedWorkdayCode('none');
      }
      
      console.timeEnd('initializeSubtaskForm');
      setIsInitialized(true);
    };

    if (!isInitialized) {
      loadWorkdayCodes();
      initializeForm();
    }
  }, [mode, subtask, parentTask, isInitialized]);

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
    console.time('subtaskSubmission');
    
    try {
      const subtaskData = {
        title,
        description,
        status,
        parent_task_id: parentTask.id,
        notes,
        due_date: dueDate ? dueDate.toISOString() : null,
        user_id: user.id,
        assigned_to: assignedTo === 'none' ? null : assignedTo,
        workday_code_id: selectedWorkdayCode === 'none' ? null : selectedWorkdayCode
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
      console.timeEnd('subtaskSubmission');
      setIsSubmitting(false);
    }
  };

  // Reset the initialization state when dependencies change
  useEffect(() => {
    return () => {
      setIsInitialized(false);
    };
  }, [mode, subtask?.id, parentTask?.id]);

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
    workdayCodes,
    selectedWorkdayCode,
    setSelectedWorkdayCode,
    isSubmitting,
    handleSubmit,
  };
};
