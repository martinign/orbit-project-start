
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusPieChart } from "../charts/TaskStatusPieChart";

export function TasksStatisticsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks_statistics"],
    queryFn: async () => {
      const { data: notStarted, error: error1 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "not started");
        
      const { data: inProgress, error: error2 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "in progress");
        
      const { data: completed, error: error3 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "completed");
        
      const { data: blocked, error: error4 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "blocked");
      
      if (error1 || error2 || error3 || error4) {
        throw new Error("Failed to fetch task statistics");
      }
      
      return [
        { name: "Not Started", value: notStarted?.length || 0, color: "#f87171" },
        { name: "In Progress", value: inProgress?.length || 0, color: "#60a5fa" },
        { name: "Completed", value: completed?.length || 0, color: "#4ade80" },
        { name: "Blocked", value: blocked?.length || 0, color: "#fb923c" },
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
