
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { columnsConfig } from '@/components/tasks/columns-config';

export const useTaskDragAndDrop = (onRefetch: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped in the same place, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Check if the task is being dropped on the archive button
    const isArchiveDropTarget = document.querySelector('[data-droppable-id="archive-drop-target"]');
    const archiveRect = isArchiveDropTarget?.getBoundingClientRect();
    
    // Get the client coordinates of the drop
    const clientX = result.client?.x;
    const clientY = result.client?.y;
    
    // Check if drop happened over the archive button
    if (archiveRect && 
        clientX >= archiveRect.left && 
        clientX <= archiveRect.right && 
        clientY >= archiveRect.top && 
        clientY <= archiveRect.bottom) {
      try {
        console.log('Archiving task:', draggableId);
        // Mark the task as completed if it's not already and archive it
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({ 
            status: 'completed',
            is_archived: true 
          })
          .eq('id', draggableId);

        if (updateError) {
          console.error('Error updating task:', updateError);
          throw updateError;
        }

        toast({
          title: 'Task Archived',
          description: 'The task has been completed and archived.',
        });
        
        // Invalidate all relevant queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['gantt_tasks'] });
        queryClient.invalidateQueries({ queryKey: ['archived_tasks'] });
        onRefetch();
        return;
      } catch (error) {
        console.error('Error archiving task:', error);
        toast({
          title: 'Error',
          description: 'Failed to archive task.',
          variant: 'destructive',
        });
      }
    }

    // Normal column movement continues as before
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

  const archiveTask = async (taskId: string) => {
    try {
      console.log('Archiving task with ID:', taskId);
      const { error } = await supabase
        .from('project_tasks')
        .update({ 
          status: 'completed', 
          is_archived: true 
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error in SQL update:', error);
        throw error;
      }

      toast({
        title: 'Task Archived',
        description: 'The task has been archived successfully.',
      });
      
      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archived_tasks'] });
      onRefetch();
      return true;
    } catch (error) {
      console.error('Error archiving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive task.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unarchiveTask = async (taskId: string) => {
    try {
      console.log('Unarchiving task with ID:', taskId);
      const { error } = await supabase
        .from('project_tasks')
        .update({ is_archived: false })
        .eq('id', taskId);

      if (error) {
        console.error('Error in SQL update:', error);
        throw error;
      }

      toast({
        title: 'Task Unarchived',
        description: 'The task has been restored to the Kanban board.',
      });
      
      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archived_tasks'] });
      onRefetch();
      return true;
    } catch (error) {
      console.error('Error unarchiving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to unarchive task.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { 
    handleDragEnd,
    archiveTask,
    unarchiveTask
  };
};
