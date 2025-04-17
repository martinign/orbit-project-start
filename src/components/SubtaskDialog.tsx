
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

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
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

interface TeamMember {
  id: string;
  full_name: string;
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
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not started');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch team members to use as options for assignedTo field
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
    if (open) {
      if (mode === 'edit' && subtask) {
        // Populate form with subtask data for editing
        setTitle(subtask.title || '');
        setDescription(subtask.description || '');
        setStatus(subtask.status || 'not started');
        setNotes(subtask.notes || '');
        setAssignedTo(subtask.assigned_to || '');
        
        if (subtask.due_date) {
          setDueDate(new Date(subtask.due_date));
        } else {
          setDueDate(undefined);
        }
      } else {
        // Reset form for new subtask creation
        setTitle('');
        setDescription('');
        setStatus('not started');
        setDueDate(undefined);
        setNotes('');
        setAssignedTo('');
      }
    }
  }, [open, mode, subtask, parentTask]);

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
        assigned_to: assignedTo || null
      };
      
      if (mode === 'edit' && subtask?.id) {
        // Update existing subtask
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
        // Create new subtask
        const { error } = await supabase
          .from('project_subtasks')
          .insert(subtaskData);
            
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Subtask created successfully",
        });
      }
      
      // Reset form and close dialog
      onClose();
      
      // Refresh the list if onSuccess callback is provided
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Subtask title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Subtask description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

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
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update subtask' : 'Create subtask'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubtaskDialog;
