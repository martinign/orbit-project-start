
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  selectedProject: string | undefined;
  dueDate: Date | undefined;
  notes: string;
  assignedTo: string;
  projects: Project[];
  isSubmitting: boolean;
  didInitialFormSet: boolean;
}

export const useTaskForm = (
  mode: 'create' | 'edit',
  task?: any, 
  projectId?: string,
  onSuccess?: () => void,
  onClose?: () => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not started');
  const [priority, setPriority] = useState('medium');
  const [selectedProject, setSelectedProject] = useState<string | undefined>(projectId);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('none');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didInitialFormSet, setDidInitialFormSet] = useState(false);
  
  // Initialize form data
  useEffect(() => {
    if (!didInitialFormSet) {
      if (!projectId) {
        const fetchProjects = async () => {
          const { data } = await supabase
            .from('projects')
            .select('id, project_number, Sponsor')
            .order('project_number', { ascending: true });
          
          if (data) setProjects(data);
        };
        
        fetchProjects();
      }

      if (mode === 'edit' && task) {
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
        
        setSelectedProject(task.project_id || projectId);
        
        if (task.due_date) {
          setDueDate(new Date(task.due_date));
        }
      } else {
        setTitle('');
        setDescription('');
        setStatus(task?.status || 'not started');
        setPriority('medium');
        setNotes('');
        setAssignedTo('none');
        setDueDate(undefined);
        setSelectedProject(projectId);
      }

      setDidInitialFormSet(true);
    }
  }, [mode, task, projectId, didInitialFormSet]);

  // Reset form when dialog closes
  useEffect(() => {
    return () => {
      setDidInitialFormSet(false);
    };
  }, []);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save tasks",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        project_id: selectedProject,
        notes,
        due_date: dueDate ? dueDate.toISOString() : null,
        assigned_to: assignedTo === 'none' ? null : assignedTo,
        user_id: user.id,
      };
      
      console.log("Saving task with data:", taskData);
      
      if (mode === 'edit' && task) {
        const { error } = await supabase
          .from('project_tasks')
          .update({
            ...taskData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('project_tasks')
          .insert(taskData);
          
        if (error) throw error;
        
        // Explicitly invalidate the new tasks count query
        queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
        
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }

      // Use setTimeout to ensure state updates complete before closing
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      }, 100);
      
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
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
    priority,
    setPriority,
    dueDate,
    setDueDate,
    notes,
    setNotes,
    assignedTo,
    setAssignedTo,
    selectedProject,
    setSelectedProject,
    projects,
    isSubmitting,
    handleSubmit,
  };
};
