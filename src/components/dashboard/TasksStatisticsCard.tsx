
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
        
      let completedQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "completed");
        
      let blockedQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "blocked");
      
      // Apply project filter if provided
      if (filters.projectId && filters.projectId !== "all") {
        notStartedQuery = notStartedQuery.eq("project_id", filters.projectId);
        inProgressQuery = inProgressQuery.eq("project_id", filters.projectId);
        completedQuery = completedQuery.eq("project_id", filters.projectId);
        blockedQuery = blockedQuery.eq("project_id", filters.projectId);
      }
      
      // Apply date filters if provided
      if (filters.startDate) {
        notStartedQuery = notStartedQuery.gte("updated_at", filters.startDate.toISOString());
        inProgressQuery = inProgressQuery.gte("updated_at", filters.startDate.toISOString());
        completedQuery = completedQuery.gte("updated_at", filters.startDate.toISOString());
        blockedQuery = blockedQuery.gte("updated_at", filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        notStartedQuery = notStartedQuery.lte("updated_at", filters.endDate.toISOString());
        inProgressQuery = inProgressQuery.lte("updated_at", filters.endDate.toISOString());
        completedQuery = completedQuery.lte("updated_at", filters.endDate.toISOString());
        blockedQuery = blockedQuery.lte("updated_at", filters.endDate.toISOString());
      }
      
      // Execute all queries in parallel
      const [notStarted, inProgress, completed, blocked] = await Promise.all([
        notStartedQuery,
        inProgressQuery,
        completedQuery,
        blockedQuery
      ]);
      
      if (notStarted.error || inProgress.error || completed.error || blocked.error) {
        throw new Error("Failed to fetch task statistics");
      }
      
      return [
        { name: "Not Started", value: notStarted.data?.length || 0, color: "#f87171" },
        { name: "In Progress", value: inProgress.data?.length || 0, color: "#60a5fa" },
        { name: "Completed", value: completed.data?.length || 0, color: "#4ade80" },
        { name: "Blocked", value: blocked.data?.length || 0, color: "#fb923c" },
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
