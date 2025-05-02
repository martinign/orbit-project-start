
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
  | 'workday_codes'
  | 'project_important_links'
  | 'survey_responses'
  | 'project_doc_requests'
  | 'workday_time_entries'
  | 'team_assigned_hours';

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
    // Skip if no filterValue is provided when filter is required
    if (filter && !filterValue) {
      console.log(`Skipping realtime subscription for ${table} - missing filterValue`);
      return;
    }
    
    const channelName = `db-changes-${table}-${Math.random().toString(36).substring(2, 15)}`;
    const channel = supabase.channel(channelName);
    
    const config: any = {
      event: event,
      schema: 'public',
      table: table,
      ...(filter && filterValue ? { filter: `${filter}=eq.${filterValue}` } : {})
    };

    console.log(`Setting up realtime subscription for ${table}:`, config);

    channel
      .on('postgres_changes', config, (payload) => {
        console.log(`Received change for ${table}:`, payload);
        onRecordChange(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${table} changes`);
        } else {
          console.log(`Subscription status for ${table}: ${status}`);
        }
      });

    return () => {
      console.log(`Removing channel for ${table}`);
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, filterValue, onRecordChange]);
}
