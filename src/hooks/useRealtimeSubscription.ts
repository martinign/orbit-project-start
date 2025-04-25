
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'project_tasks' | 'project_notes' | 'project_contacts' | 
                 'project_team_members' | 'project_invitations' | 'projects' | 
                 'project_events';

interface SubscriptionOptions {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValue?: string;
  onRecordChange: (payload: any) => void;
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
    
    // Initialize the channel
    const channel = supabase.channel(channelName);

    // Define the filter settings
    const filterOptions = filter && filterValue 
      ? { filter: `${filter}=eq.${filterValue}` } 
      : {};

    // Set up the subscription
    channel
      .on(
        'postgres_changes', 
        { 
          event: event,
          schema: 'public',
          table: table,
          ...filterOptions
        },
        (payload) => {
          onRecordChange(payload);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, filterValue, onRecordChange]);
}
