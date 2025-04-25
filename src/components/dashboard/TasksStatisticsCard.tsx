
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusPieChart } from "../charts/TaskStatusPieChart";

export function TasksStatisticsCard({ filters = {} }: { filters?: any }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks_statistics", filters],
    queryFn: async () => {
      // Base queries for each status
      let notStartedQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "not started");
        
      let inProgressQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "in progress");
        
      let pendingQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "pending");
        
      let completedQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "completed");
        
      let stuckedQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "stucked");
      
      // Apply project filter if provided
      if (filters.projectId && filters.projectId !== "all") {
        notStartedQuery = notStartedQuery.eq("project_id", filters.projectId);
        inProgressQuery = inProgressQuery.eq("project_id", filters.projectId);
        pendingQuery = pendingQuery.eq("project_id", filters.projectId);
        completedQuery = completedQuery.eq("project_id", filters.projectId);
        stuckedQuery = stuckedQuery.eq("project_id", filters.projectId);
      }
      
      // Apply category filter if provided
      if (filters.category && filters.category !== "all") {
        // This would need to be implemented based on how categories are stored
        // For this example, we're assuming we don't have a category field yet
      }
      
      // Execute all queries in parallel
      const [notStarted, inProgress, pending, completed, stucked] = await Promise.all([
        notStartedQuery,
        inProgressQuery,
        pendingQuery,
        completedQuery,
        stuckedQuery
      ]);
      
      if (notStarted.error || inProgress.error || pending.error || completed.error || stucked.error) {
        throw new Error("Failed to fetch task statistics");
      }
      
      return [
        { name: "Not Started", value: notStarted.data?.length || 0, color: "#f87171" },
        { name: "In Progress", value: inProgress.data?.length || 0, color: "#60a5fa" },
        { name: "Pending", value: pending.data?.length || 0, color: "#fbbf24" },
        { name: "Completed", value: completed.data?.length || 0, color: "#4ade80" },
        { name: "Stucked", value: stucked.data?.length || 0, color: "#fb923c" },
      ];
    },
    refetchOnWindowFocus: false,
  });

  const total = data?.reduce((acc, item) => acc + item.value, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Task Status Distribution</CardTitle>
        <CardDescription>Overview of all task statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : total === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No tasks data available
          </div>
        ) : (
          <div className="space-y-4">
            <TaskStatusPieChart data={data || []} />
            <div className="grid grid-cols-2 gap-2">
              {data?.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({Math.round((item.value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
