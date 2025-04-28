
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// All available tables in our database
export type TableName =
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

// Subscription configuration for a single table
export interface TableSubscription {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValue?: string;
  queryKey: string | string[];
}

interface UseGlobalRealtimeSubscriptionProps {
  subscriptions: TableSubscription[];
  enabled?: boolean;
  debounceMs?: number;
  onError?: (error: any) => void;
}

/**
 * A hook to manage multiple real-time subscriptions with debouncing and query invalidation
 */
export function useGlobalRealtimeSubscription({
  subscriptions,
  enabled = true,
  debounceMs = 100,
  onError
}: UseGlobalRealtimeSubscriptionProps) {
  const queryClient = useQueryClient();
  const [lastUpdates, setLastUpdates] = useState<Record<string, Date>>({});
  
  // Use refs to avoid recreating functions/timeouts on each render
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const activeChannelsRef = useRef<Record<string, any>>({});

  // Helper function to generate a unique key for a subscription
  const getSubscriptionKey = (sub: TableSubscription) => {
    return `${sub.table}:${sub.event || '*'}:${sub.filter || ''}:${sub.filterValue || ''}`;
  };

  // Helper function to invalidate queries with debouncing
  const debouncedInvalidateQueries = (queryKey: string | string[], subscriptionKey: string) => {
    // Clear existing timeout for this subscription if it exists
    if (timeoutsRef.current[subscriptionKey]) {
      clearTimeout(timeoutsRef.current[subscriptionKey]);
    }
    
    // Set new timeout for this subscription
    timeoutsRef.current[subscriptionKey] = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      console.log(`Invalidated query for ${subscriptionKey}`, queryKey);
      
      // Update last update time
      setLastUpdates(prev => ({
        ...prev,
        [subscriptionKey]: new Date()
      }));
    }, debounceMs);
  };

  useEffect(() => {
    if (!enabled || subscriptions.length === 0) return;

    // Create channels for subscriptions
    subscriptions.forEach(subscription => {
      const { table, event = '*', filter, filterValue, queryKey } = subscription;
      const subscriptionKey = getSubscriptionKey(subscription);
      
      // Skip if channel already exists
      if (activeChannelsRef.current[subscriptionKey]) return;
      
      // Create a unique channel name
      const channelName = `${table}-${event}-${Math.random().toString(36).substring(2, 15)}`;
      
      const channel = supabase.channel(channelName);
      
      // Configure the subscription
      const config: any = {
        event: event,
        schema: 'public',
        table: table,
        ...(filter && filterValue ? { filter: `${filter}=eq.${filterValue}` } : {})
      };

      channel
        .on('postgres_changes' as 'system', config, (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Real-time update for ${table}:`, payload);
          debouncedInvalidateQueries(queryKey, subscriptionKey);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to ${table} changes`);
            // Store the active channel
            activeChannelsRef.current[subscriptionKey] = channel;
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to ${table} changes`);
            if (onError) onError(`Subscription error for table ${table}`);
          }
        });
    });

    // Cleanup function to remove all channels
    return () => {
      Object.values(activeChannelsRef.current).forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
      
      // Clear all timeouts
      Object.values(timeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      // Reset refs
      activeChannelsRef.current = {};
      timeoutsRef.current = {};
    };
  }, [subscriptions, enabled, queryClient, debounceMs, onError]);

  return {
    lastUpdates,
    isSubscribed: Object.keys(activeChannelsRef.current).length > 0
  };
}
