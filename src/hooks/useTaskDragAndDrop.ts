
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { columnsConfig } from '@/components/tasks/columns-config';

export const useTaskDragAndDrop = (onRefetch: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

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
