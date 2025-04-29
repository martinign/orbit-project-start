
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw } from 'lucide-react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const codeSchema = z.object({
  task: z.string().min(1, { message: "Task is required" }),
  activity: z.string().min(1, { message: "Activity is required" })
});

type CodeFormData = z.infer<typeof codeSchema>;

interface WorkdayCode {
  id: string;
  task: string;
  activity: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

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
  const [workdayCodes, setWorkdayCodes] = useState<WorkdayCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: code ? {
      task: code.task,
      activity: code.activity
    } : { task: '', activity: '' }
  });

  const isEditing = !!code;

  // Subscribe to real-time changes in workday_codes table
  useRealtimeSubscription({
    table: 'workday_codes' as any,
    event: '*',
    onRecordChange: () => {
      fetchWorkdayCodes();
    }
  });

  // Fetch all workday codes
  const fetchWorkdayCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workday_codes')
        .select('*')
        .order('task', { ascending: true });

      if (error) throw error;
      setWorkdayCodes(data || []);
    } catch (error) {
      console.error("Error fetching workday codes:", error);
      toast({
        title: "Error",
        description: "Failed to load workday codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when dialog opens
  useEffect(() => {
    if (open) {
      fetchWorkdayCodes();
    }
  }, [open]);

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
      form.reset({ task: '', activity: '' });
      fetchWorkdayCodes();
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

  const handleRefresh = () => {
    fetchWorkdayCodes();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workday Code' : 'Create New Workday Code'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
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

          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Workday Codes</h3>
              <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : workdayCodes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No codes found</div>
            ) : (
              <div className="max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workdayCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-medium">{code.task}</TableCell>
                        <TableCell>{code.activity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkdayCodeDialog;
