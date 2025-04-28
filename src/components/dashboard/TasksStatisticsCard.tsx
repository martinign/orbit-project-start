
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusPieChart } from "../charts/TaskStatusPieChart";
import { columnsConfig } from "../tasks/columns-config";

interface TaskFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  showNewTasks?: boolean;
}

export function TasksStatisticsCard({ filters = {} }: { filters?: TaskFilters }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks_statistics", filters],
    queryFn: async () => {
      const statuses = filters.status 
        ? [filters.status] 
        : ["not started", "in progress", "pending", "completed", "stucked"];
      
      const queries = statuses.map(status => {
        let query = supabase
          .from("project_tasks")
          .select("id", { count: "exact" })
          .eq("status", status);
        
        if (filters.projectId && filters.projectId !== "all") {
          query = query.eq("project_id", filters.projectId);
        }
        
        if (filters.priority && filters.priority !== "all") {
          query = query.eq("priority", filters.priority);
        }

        if (filters.showNewTasks) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          query = query.gte("created_at", yesterday.toISOString());
        }
        
        return query;
      });
      
      const results = await Promise.all(queries);
      
      // Check for errors in any query
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error("Failed to fetch task statistics");
      }

      // Map status to colors based on columnsConfig
      return statuses.map((status, index) => {
        const column = columnsConfig.find(col => col.status === status);
        return {
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: results[index].data?.length || 0,
          color: column ? `var(--${column.badgeColor.replace('bg-', '')})` : '#888888'
        };
      });
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
            
            {/* Two-row layout for status legend */}
            <div className="grid grid-rows-2 gap-2">
              <div className="grid grid-cols-3 gap-2">
                {data?.slice(0, 3).map((item) => (
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
              <div className="grid grid-cols-2 gap-2">
                {data?.slice(3).map((item) => (
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
