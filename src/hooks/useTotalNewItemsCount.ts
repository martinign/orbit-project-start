
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTotalNewItemsCount() {
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

  return {
    newTasksCount,
    newEventsCount,
    totalCount: (newTasksCount || 0) + (newEventsCount || 0)
  };
}
