
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  task?: any; // For editing existing tasks
  projectId?: string;
  onSuccess?: () => void;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ 
  open, 
  onClose, 
  mode = 'create', 
  task, 
  projectId, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not started');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(projectId);
  const [projects, setProjects] = useState<any[]>([]);

  // Fetch team members for assignedTo field
  const { data: teamMembers, isLoading: isLoadingTeamMembers } = useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    // Fetch projects for the dropdown if no projectId is provided
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

    // Set form values when editing a task
    if (mode === 'edit' && task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'not started');
      setPriority(task.priority || 'medium');
      setNotes(task.notes || '');
      setAssignedTo(task.assigned_to || '');
      setSelectedProject(task.project_id || projectId);
      
      if (task.due_date) {
        setDueDate(new Date(task.due_date));
      }
    } else {
      // Reset form for new task creation
      setTitle('');
      setDescription('');
      setStatus('not started');
      setPriority('medium');
      setNotes('');
      setAssignedTo('');
      setDueDate(undefined);
      setSelectedProject(projectId);
    }
  }, [mode, task, projectId]);

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
        assigned_to: assignedTo || null,
        user_id: user.id,
      };
      
      if (mode === 'edit' && task) {
        // Update existing task
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
        // Create new task
        const { error } = await supabase
          .from('project_tasks')
          .insert(taskData);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
      
      // Reset form and close dialog
      onClose();
      
      // Refresh the list if onSuccess callback is provided
      if (onSuccess) {
        onSuccess();
      }
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Make changes to your task here.' 
              : 'Fill out the form to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {!projectId && (
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select 
                value={selectedProject} 
                onValueChange={setSelectedProject} 
                required
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_number} - {project.Sponsor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not started">Not Started</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not assigned</SelectItem>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.id} value={member.full_name}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
