
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback, useEffect } from "react";

export function useTotalNewItemsCount() {
  const queryClient = useQueryClient();
  const [badgeVisible, setBadgeVisible] = useState(true);

  // Query for new tasks count
  const { data: newTasksCount = 0 } = useQuery({
    queryKey: ["new_tasks_count"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count, error } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .gte("created_at", yesterday.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Query for new events count
  const { data: newEventsCount = 0 } = useQuery({
    queryKey: ["new_events_count"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count, error } = await supabase
        .from("project_events")
        .select("id", { count: "exact" })
        .gte("created_at", yesterday.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Add real-time subscription for tasks and events
  useEffect(() => {
    // Subscribe to task changes
    const tasksChannel = supabase.channel('total_new_tasks_count')
      .on('postgres_changes', {
        event: '*', // Listen to all events
        schema: 'public',
        table: 'project_tasks',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
      })
      .subscribe();
      
    // Subscribe to event changes
    const eventsChannel = supabase.channel('total_new_events_count')
      .on('postgres_changes', {
        event: '*', // Listen to all events
        schema: 'public',
        table: 'project_events',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [queryClient]);

  // Calculate total count
  const totalCount = badgeVisible ? (newTasksCount || 0) + (newEventsCount || 0) : 0;

  // Hide badge - will be called when the user clicks on the badge
  const hideBadge = useCallback(() => {
    setBadgeVisible(false);
  }, []);

  // Show badge again if there are new items
  const showBadgeIfNewItems = useCallback(() => {
    if ((newTasksCount || 0) + (newEventsCount || 0) > 0) {
      setBadgeVisible(true);
    }
  }, [newTasksCount, newEventsCount]);

  return {
    newTasksCount,
    newEventsCount,
    totalCount,
    hideBadge,
    showBadgeIfNewItems,
    badgeVisible
  };
}
