
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export type ItemType = 'task' | 'note' | 'event';

interface NewItemsCount {
  [key: string]: number;
}

export function useNewItems(projectId: string) {
  const queryClient = useQueryClient();
  const [newItemsCount, setNewItemsCount] = useState<NewItemsCount>({});

  const { data: counts } = useQuery({
    queryKey: ['new_items_count', projectId],
    queryFn: async () => {
      const types: ItemType[] = ['task', 'note', 'event'];
      
      const counts = await Promise.all(
        types.map(async (type) => {
          let tableName: string;
          
          // Map the ItemType to actual table names
          switch(type) {
            case 'task':
              tableName = 'project_tasks';
              break;
            case 'note':
              tableName = 'project_notes';
              break;
            case 'event':
              tableName = 'project_events';
              break;
            default:
              tableName = `project_${type}s`;
          }
          
          const { count, error } = await supabase
            .from(tableName)
            .select('id', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            
          if (error) {
            console.error(`Error fetching new ${type}s count:`, error);
            return { type, count: 0 };
          }
          
          return { type, count: count || 0 };
        })
      );
      
      return Object.fromEntries(counts.map(({ type, count }) => [type, count]));
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (counts) {
      setNewItemsCount(counts);
    }
  }, [counts]);

  // Add real-time subscription for tasks, notes, and events
  useEffect(() => {
    if (!projectId) return;

    const tables = ['project_tasks', 'project_notes', 'project_events'];
    const channels = tables.map(table => {
      const channel = supabase.channel(`${table}_changes_${projectId}`);
      
      channel
        .on('postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table,
            filter: `project_id=eq.${projectId}`
          },
          async () => {
            // Invalidate the query to trigger a refresh
            queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for ${table}:`, status);
        });

      return channel;
    });

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [projectId, queryClient]);

  return {
    newItemsCount,
    markItemViewed: async (itemId: string, itemType: ItemType) => {
      setNewItemsCount(prev => ({
        ...prev,
        [itemType]: Math.max(0, (prev[itemType] || 0) - 1)
      }));
    }
  };
}
