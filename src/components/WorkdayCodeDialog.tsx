
import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const codeSchema = z.object({
  task: z.string().min(1, { message: "Task is required" }),
  activity: z.string().min(1, { message: "Activity is required" })
});

type CodeFormData = z.infer<typeof codeSchema>;

interface WorkdayCodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  code?: any;
}

const WorkdayCodeDialog: React.FC<WorkdayCodeDialogProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  code 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: code ? {
      task: code.task,
      activity: code.activity
    } : { task: '', activity: '' }
  });

  const isEditing = !!code;

  const onSubmit = async (data: CodeFormData) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('workday_codes')
          .update({
            task: data.task,
            activity: data.activity,
            updated_at: new Date().toISOString()
          })
          .eq('id', code.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Workday code updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('workday_codes')
          .insert({
            task: data.task,
            activity: data.activity,
            user_id: user?.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Workday code created successfully",
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.code === "23505" 
          ? "This task and activity combination already exists" 
          : (isEditing ? "Failed to update the code" : "Failed to create the code"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workday Code' : 'Create New Workday Code'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter activity name" {...field} />
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
                {isEditing ? 'Update Code' : 'Create Code'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkdayCodeDialog;
