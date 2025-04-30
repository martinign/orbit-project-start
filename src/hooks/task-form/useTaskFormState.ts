
import { useState, useEffect } from 'react';

interface TaskFormStateProps {
  task?: any;
  mode: 'create' | 'edit';
  initialStatus?: string;
}

export const useTaskFormState = ({ task, mode, initialStatus = 'not started' }: TaskFormStateProps) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('none');
  const [didInitialFormSet, setDidInitialFormSet] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (!didInitialFormSet) {
      console.time('initializeTaskForm');
      
      if (mode === 'edit' && task) {
        console.log('Initializing edit form with task data:', task);
        
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.status || 'not started');
        setPriority(task.priority || 'medium');
        setNotes(task.notes || '');
        
        if (task.assigned_to) {
          setAssignedTo(task.assigned_to);
        } else {
          setAssignedTo('none');
        }
        
        if (task.due_date) {
          setDueDate(new Date(task.due_date));
        }
      } else {
        // For create mode, reset all fields
        console.log('Initializing create form with default values');
        setTitle('');
        setDescription('');
        setStatus(initialStatus);
        setPriority('medium');
        setNotes('');
        setAssignedTo('none');
        setDueDate(undefined);
      }

      setDidInitialFormSet(true);
      console.timeEnd('initializeTaskForm');
    }
  }, [mode, task, didInitialFormSet, initialStatus]);

  // Reset form when unmounting
  useEffect(() => {
    return () => {
      setDidInitialFormSet(false);
    };
  }, []);

  return {
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    notes,
    setNotes,
    assignedTo,
    setAssignedTo,
    didInitialFormSet,
    setDidInitialFormSet,
  };
};
