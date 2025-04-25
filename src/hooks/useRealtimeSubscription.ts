
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

    const channel: RealtimeChannel = supabase.channel('db-changes')
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...filterObject
        },
        (payload) => {
          onRecordChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, filterValue, onRecordChange]);
}
