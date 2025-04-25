
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
    let filterObject = {};
    if (filter && filterValue) {
      filterObject = {
        [filter]: filterValue
      };
    }

    // Create a unique channel name for this subscription
    const channelName = `db-changes-${table}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Initialize the channel
    const channel = supabase.channel(channelName);

    // Configure the channel with postgres_changes
    const subscription = channel.on(
      'postgres_changes', 
      { 
        event: event,
        schema: 'public',
        table: table,
        ...(filter && filterValue ? { filter: `${filter}=eq.${filterValue}` } : {})
      },
      (payload) => {
        onRecordChange(payload);
      }
    );
    
    // Subscribe to the channel
    subscription.subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, filterValue, onRecordChange]);
}
