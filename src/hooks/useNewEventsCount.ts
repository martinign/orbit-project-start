
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useNewEventsCount() {
  const queryClient = useQueryClient();
  
  // Add real-time subscription for events
  useEffect(() => {
    const channel = supabase.channel('new_events_count_subscription')
      .on('postgres_changes', 
        {
          event: '*', // Listen for all events including DELETE
          schema: 'public',
          table: 'project_events'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  return useQuery({
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
}
