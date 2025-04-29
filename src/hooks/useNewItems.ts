
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export type ItemType = 'task' | 'note' | 'event' | 'contact';

interface NewItemsCount {
  [key: string]: number;
}

export function useNewItems(projectId: string) {
  const queryClient = useQueryClient();
  const [newItemsCount, setNewItemsCount] = useState<NewItemsCount>({});

  const { data: counts } = useQuery({
    queryKey: ['new_items_count', projectId],
    queryFn: async () => {
      const types: ItemType[] = ['task', 'note', 'event', 'contact'];
      
      const counts = await Promise.all(
        types.map(async (type) => {
          let tableName: string;
          let count = 0;
          let error = null;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
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
            case 'contact':
              tableName = 'project_contacts';
              break;
            default:
              tableName = `project_${type}s`;
          }
          
          // Use explicit query for each table type
          if (tableName === 'project_tasks') {
            const result = await supabase
              .from('project_tasks')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', yesterday.toISOString());
            
            count = result.count || 0;
            error = result.error;
          } else if (tableName === 'project_notes') {
            const result = await supabase
              .from('project_notes')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', yesterday.toISOString());
            
            count = result.count || 0;
            error = result.error;
          } else if (tableName === 'project_events') {
            const result = await supabase
              .from('project_events')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', yesterday.toISOString());
            
            count = result.count || 0;
            error = result.error;
          } else if (tableName === 'project_contacts') {
            const result = await supabase
              .from('project_contacts')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', yesterday.toISOString());
            
            count = result.count || 0;
            error = result.error;
          }
            
          if (error) {
            console.error(`Error fetching new ${type}s count:`, error);
            return { type, count: 0 };
          }
          
          return { type, count };
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

  // Add real-time subscription for tasks, notes, events, and contacts
  useEffect(() => {
    if (!projectId) return;

    const tables = ['project_tasks', 'project_notes', 'project_events', 'project_contacts'];
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
          async (payload) => {
            console.log(`New items change detected for ${table}:`, payload);
            // Invalidate the query to trigger a refresh
            queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
            
            // Also invalidate the specific count queries
            if (table === 'project_notes') {
              queryClient.invalidateQueries({ queryKey: ['project_notes_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
            } else if (table === 'project_events') {
              queryClient.invalidateQueries({ queryKey: ['project_events_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
            } else if (table === 'project_tasks') {
              queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            } else if (table === 'project_contacts') {
              queryClient.invalidateQueries({ queryKey: ['project_contacts', projectId] });
              queryClient.invalidateQueries({ queryKey: ['project_contacts_count', projectId] });
            }
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
