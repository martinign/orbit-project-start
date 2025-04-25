import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  RealtimePostgresChangesPayload, 
  RealtimePostgresChangesFilter,
  RealtimeChannel
} from '@supabase/supabase-js';

type TableName = 'project_tasks' | 'project_notes' | 'project_contacts' | 
                 'project_team_members' | 'project_invitations' | 'projects' | 
                 'project_events';

interface SubscriptionOptions {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValue?: string;
  onRecordChange: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  filterValue,
  onRecordChange
}: SubscriptionOptions) {
  useEffect(() => {
    // Create a unique channel name for this subscription
    const channelName = `db-changes-${table}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Define the filter settings
    const filterOptions: RealtimePostgresChangesFilter<"*"> = {
      event: event,
      schema: 'public',
      table: table,
      ...(filter && filterValue ? { filter: `${filter}=eq.${filterValue}` } : {})
    };

    try {
      // Create and configure the channel with correct typing
      const channel = supabase.channel(channelName);
      
      // Add the postgres_changes listener with proper configuration
      channel.on(
        'postgres_changes',
        filterOptions,
        onRecordChange
      );

      // Subscribe to the channel
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${table} changes`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${table} changes`);
        }
      });

      // Cleanup function
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  }, [table, event, filter, filterValue, onRecordChange]);
}
