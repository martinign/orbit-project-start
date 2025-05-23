
import { useState, useEffect } from 'react';

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

export const useSubtaskFormState = ({ 
  subtask, 
  mode 
}: { 
  subtask?: Subtask; 
  mode: 'create' | 'edit';
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not started');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('none');
  const [didInitialFormSet, setDidInitialFormSet] = useState(false);
  
  // Initialize form with subtask data if in edit mode
  useEffect(() => {
    if (!didInitialFormSet) {
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
      } else {
        // Reset form for create mode
        console.log('Initializing create subtask form with default values');
        setTitle('');
        setDescription('');
        setStatus('not started');
        setDueDate(undefined);
        setNotes('');
        setAssignedTo('none');
      }
      
      setDidInitialFormSet(true);
    }
  }, [mode, subtask, didInitialFormSet]);

  // Reset function for cleanup
  const resetFormState = () => {
    setDidInitialFormSet(false);
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
    didInitialFormSet,
    resetFormState
  };
};
