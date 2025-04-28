
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

export type ItemType = 'task' | 'note' | 'contact' | 'teamMember' | 'event';

interface NewItemsCount {
  [key: string]: number;
}

export function useNewItems(projectId: string) {
  const queryClient = useQueryClient();
  const [newItemsCount, setNewItemsCount] = useState<NewItemsCount>({});

  const { data: counts } = useQuery({
    queryKey: ['new_items_count', projectId],
    queryFn: async () => {
      const types: ItemType[] = ['task', 'note', 'contact', 'teamMember', 'event'];
      
      const counts = await Promise.all(
        types.map(async (type) => {
          let count = 0;
          let error = null;
          
          // Use specific table queries instead of dynamic table names
          if (type === 'task') {
            const result = await supabase
              .from('project_tasks')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            count = result.count || 0;
            error = result.error;
          } else if (type === 'note') {
            const result = await supabase
              .from('project_notes')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            count = result.count || 0;
            error = result.error;
          } else if (type === 'contact') {
            const result = await supabase
              .from('project_contacts')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            count = result.count || 0;
            error = result.error;
          } else if (type === 'teamMember') {
            const result = await supabase
              .from('project_team_members')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            count = result.count || 0;
            error = result.error;
          } else if (type === 'event') {
            const result = await supabase
              .from('project_events')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId)
              .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
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

  // Add real-time subscription for all types
  useEffect(() => {
    if (!projectId) return;

    const tables = [
      'project_tasks', 
      'project_notes', 
      'project_contacts', 
      'project_team_members', 
      'project_events'
    ];

    const channels = tables.map(table => {
      const channel = supabase.channel(`${table}_changes_${projectId}`);
      
      // Subscribe to both INSERT and DELETE events
      channel
        .on('postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table,
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            console.log(`Realtime event for ${table}:`, payload);
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
