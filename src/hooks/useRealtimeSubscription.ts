
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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
    const channelName = `db-changes-${table}-${Math.random().toString(36).substring(2, 15)}`;
    const channel = supabase.channel(channelName);
    
    const config: any = {
      event: event,
      schema: 'public',
      table: table,
      ...(filter && filterValue ? { filter: `${filter}=eq.${filterValue}` } : {})
    };

    channel
      .on('postgres_changes' as 'system', config, (payload) => {
        console.log(`Received change for ${table}:`, payload);
        onRecordChange(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${table} changes`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, filterValue, onRecordChange]);
}
