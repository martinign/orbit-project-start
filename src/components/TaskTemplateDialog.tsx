
import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const templateSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters long" }),
  description: z.string().optional()
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TaskTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template?: any;
}

const TaskTemplateDialog: React.FC<TaskTemplateDialogProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  template 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      title: template.title,
      description: template.description || ''
    } : { title: '', description: '' }
  });

  const isEditing = !!template;

  const onSubmit = async (data: TemplateFormData) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('task_templates')
          .update({
            title: data.title,
            description: data.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('task_templates')
          .insert({
            title: data.title,
            description: data.description,
            user_id: user?.id
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing 
          ? "Failed to update the template" 
          : "Failed to create the template",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task Template' : 'Create Task Template'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description of the template" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskTemplateDialog;
