
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
  | 'task_templates';

interface SubscriptionOptions {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValue?: string;
  projectId?: string;
  onRecordChange: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  filterValue,
  projectId,
  onRecordChange
}: SubscriptionOptions) {
  useEffect(() => {
    // Use a unique channel name to avoid conflicts
    const channelName = `db-changes-${table}-${Math.random().toString(36).substring(2, 15)}`;
    const channel = supabase.channel(channelName);
    
    let config: any = {
      event: event,
      schema: 'public',
      table: table
    };

    // Add filter if provided
    if (filter && filterValue) {
      config.filter = `${filter}=eq.${filterValue}`;
    }
    // Add project filter if provided
    else if (projectId) {
      config.filter = `project_id=eq.${projectId}`;
    }

    console.log(`Setting up realtime subscription for ${table} with config:`, config);

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
  }, [table, event, filter, filterValue, projectId, onRecordChange]);
}
