
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName =
  | 'profiles'
  | 'project_contacts'
  | 'project_events'
  | 'project_invitations'
  | 'project_notes'
  | 'project_subtasks'
  | 'project_task_updates'
  | 'project_tasks'
  | 'project_team_members'
  | 'projects'
  | 'task_status_history'
  | 'task_templates'
  | 'gantt_tasks';

interface SubscriptionOptions {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValue?: string;
  isNewOnly?: boolean; // New option to filter only recent records (last 24 hours)
  onRecordChange: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  filterValue,
  isNewOnly = false,
  onRecordChange
}: SubscriptionOptions) {
  useEffect(() => {
    const channelName = `db-changes-${table}-${Math.random().toString(36).substring(2, 15)}`;
    const channel = supabase.channel(channelName);
    
    let config: any = {
      event: event,
      schema: 'public',
      table: table
    };
    
    if (filter && filterValue) {
      config.filter = `${filter}=eq.${filterValue}`;
    }
    
    // Add additional filter for new records if isNewOnly is true
    // Note: This filtering happens client-side as Supabase doesn't support timestamp filtering in realtime
    
    channel
      .on('postgres_changes' as 'system', config, (payload) => {
        if (isNewOnly) {
          const createdAt = payload.new?.created_at;
          if (createdAt) {
            const createdDate = new Date(createdAt);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (createdDate >= yesterday) {
              console.log(`Received new record change for ${table}:`, payload);
              onRecordChange(payload);
            }
          }
        } else {
          console.log(`Received change for ${table}:`, payload);
          onRecordChange(payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${table} changes`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, filterValue, isNewOnly, onRecordChange]);
}
