
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
  const [isPrivate, setIsPrivate] = useState(false);
  const [didInitialFormSet, setDidInitialFormSet] = useState(false);
  
  // Reset flag when task changes
  useEffect(() => {
    if (task?.id) {
      console.log('Task changed, resetting form initialization flag for task:', task.id);
      setDidInitialFormSet(false);
    }
  }, [task?.id]);
  
  // Initialize form data
  useEffect(() => {
    if (!didInitialFormSet) {
      console.time('initializeTaskForm');
      console.log('Initializing form with task:', task?.id, 'mode:', mode);
      
      if (mode === 'edit' && task) {
        console.log('Initializing edit form with task data:', task);
        
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.status || 'not started');
        setPriority(task.priority || 'medium');
        setNotes(task.notes || '');
        setIsPrivate(task.is_private || false);
        
        if (task.assigned_to) {
          setAssignedTo(task.assigned_to);
        } else {
          setAssignedTo('none');
        }
        
        if (task.due_date) {
          setDueDate(new Date(task.due_date));
        } else {
          setDueDate(undefined);
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
        setIsPrivate(false);
      }

      setDidInitialFormSet(true);
      console.timeEnd('initializeTaskForm');
    }
  }, [mode, task, didInitialFormSet, initialStatus, task?.id]);

  // Reset form when unmounting
  useEffect(() => {
    return () => {
      console.log('Form component unmounting, cleaning up');
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
    isPrivate,
    setIsPrivate,
    didInitialFormSet,
    setDidInitialFormSet,
  };
};
