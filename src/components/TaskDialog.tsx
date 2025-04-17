
import React, { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: any; // For editing existing tasks
  onSuccess?: () => void;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ open, onClose, task, onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create tasks",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (task) {
        // Update existing template
        const { error } = await supabase
          .from('task_templates')
          .update({
            title,
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Task template updated successfully",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('task_templates')
          .insert({
            title,
            description,
            user_id: user.id
          });
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Task template created successfully",
        });
      }
      
      // Reset form and close dialog
      setTitle('');
      setDescription('');
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
          <DialogTitle>{task ? 'Edit Task Template' : 'Create New Task Template'}</DialogTitle>
          <DialogDescription>
            {task ? 'Make changes to your task template here.' : 'Fill out the form to create a new task template.'}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : task ? 'Save changes' : 'Create template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
