
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { columnsConfig, ARCHIVE_DROPPABLE_ID } from '@/components/tasks/columns-config';

export const useTaskDragAndDrop = (onRefetch: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Handle archive drop zone
    if (destination.droppableId === ARCHIVE_DROPPABLE_ID) {
      try {
        // Call the RPC function to archive the task
        const { error } = await supabase.rpc('archive_task_by_id', { task_id: draggableId });

        if (error) throw error;

        toast({
          title: 'Task Archived',
          description: 'Task has been moved to archives',
        });
        
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['gantt_tasks'] });
        onRefetch();
        
        return;
      } catch (error) {
        console.error('Error archiving task:', error);
        toast({
          title: 'Error',
          description: 'Failed to archive task.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Check if destination is archive column
    const destinationColumn = columnsConfig.find(col => col.id === destination.droppableId);
    if (destinationColumn?.isArchive) {
      try {
        // Call the RPC function to archive the task
        const { error } = await supabase.rpc('archive_task_by_id', { task_id: draggableId });

        if (error) throw error;

        toast({
          title: 'Task Archived',
          description: 'Task has been moved to archives',
        });
        
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['gantt_tasks'] });
        onRefetch();
        
        return;
      } catch (error) {
        console.error('Error archiving task:', error);
        toast({
          title: 'Error',
          description: 'Failed to archive task.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Check if source is archive column
    const sourceColumn = columnsConfig.find(col => col.id === source.droppableId);
    if (sourceColumn?.isArchive) {
      try {
        // Get the destination status
        const newStatus = columnsConfig.find(
          col => col.id === destination.droppableId
        )?.status;

        if (!newStatus) return;

        // Call the RPC function to unarchive the task and update its status
        const { error } = await supabase
          .from('project_tasks')
          .update({ 
            is_archived: false,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', draggableId);

        if (error) throw error;

        toast({
          title: 'Task Unarchived',
          description: `Task moved to ${columnsConfig.find(col => col.id === destination.droppableId)?.title}`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['gantt_tasks'] });
        onRefetch();
        
        return;
      } catch (error) {
        console.error('Error unarchiving task:', error);
        toast({
          title: 'Error',
          description: 'Failed to unarchive task.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Handle regular column to column movement
    const newStatus = columnsConfig.find(
      col => col.id === destination.droppableId
    )?.status;

    if (!newStatus) return;

    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      toast({
        title: 'Task Updated',
        description: `Task moved to ${columnsConfig.find(col => col.id === destination.droppableId)?.title}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['gantt_tasks'] });
      onRefetch();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
    }
  };

  return { handleDragEnd };
};
