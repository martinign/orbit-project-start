
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTeamMemberName } from '@/hooks/useTeamMembers';

interface TaskUpdate {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface TaskUpdatesDisplayProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

const TaskUpdatesDisplay: React.FC<TaskUpdatesDisplayProps> = ({
  open,
  onClose,
  taskId,
  taskTitle
}) => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchUpdates();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('task-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'project_task_updates',
            filter: `task_id=eq.${taskId}`
          },
          (payload) => {
            // @ts-ignore - payload.new exists
            const newUpdate = payload.new as TaskUpdate;
            setUpdates(prev => [newUpdate, ...prev]);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, taskId]);

  const fetchUpdates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_task_updates')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching task updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>Task Updates</SheetTitle>
          <SheetDescription>
            Updates and progress for task: {taskTitle}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : updates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No updates yet for this task.
            </p>
          ) : (
            updates.map((update) => (
              <UpdateItem key={update.id} update={update} />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface UpdateItemProps {
  update: TaskUpdate;
}

const UpdateItem: React.FC<UpdateItemProps> = ({ update }) => {
  const { memberName } = useTeamMemberName(update.user_id);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {memberName || 'Unknown User'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(update.created_at)}
          </span>
        </div>
      </div>
      <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
        {update.content}
      </div>
      <Separator className="mt-4" />
    </div>
  );
};

export default TaskUpdatesDisplay;
