
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeUpdatesManagerProps {
  projectId: string;
}

export const RealtimeUpdatesManager: React.FC<RealtimeUpdatesManagerProps> = ({ projectId }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const tables = ['project_tasks', 'project_notes', 'project_events', 'project_contacts'];
    const channels = tables.map(table => {
      const channel = supabase.channel(`stats_${table}_${projectId}`);
      
      channel
        .on('postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table,
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            console.log(`Stats change detected for ${table}:`, payload);
            // Invalidate relevant queries when data changes
            if (table === 'project_tasks') {
              queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
              queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
            } else if (table === 'project_notes') {
              queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
              queryClient.invalidateQueries({ queryKey: ['project_notes_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
            } else if (table === 'project_events') {
              queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
              queryClient.invalidateQueries({ queryKey: ['project_events_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['new_events_count'] });
              queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['dashboard_events'] });
            } else if (table === 'project_contacts') {
              queryClient.invalidateQueries({ queryKey: ['project_contacts', projectId] });
              queryClient.invalidateQueries({ queryKey: ['project_contacts_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
            }
          }
        )
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [projectId, queryClient]);

  // This component doesn't render anything
  return null;
};
