
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, Circle, ArrowDown } from "lucide-react";

interface TaskPrioritiesFilters {
  projectId?: string;
  status?: string;
  category?: string;
}

interface TaskPrioritiesCardProps {
  filters?: TaskPrioritiesFilters;
}

interface PriorityStats {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export function TaskPrioritiesCard({ filters = {} }: TaskPrioritiesCardProps) {
  const { data: priorityStats, isLoading } = useQuery({
    queryKey: ["task_priorities", filters],
    queryFn: async () => {
      // Base queries for each priority
      let highPriorityQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("priority", "high");
        
      let mediumPriorityQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("priority", "medium");
        
      let lowPriorityQuery = supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("priority", "low");
      
      // Apply project filter if provided
      if (filters.projectId && filters.projectId !== "all") {
        highPriorityQuery = highPriorityQuery.eq("project_id", filters.projectId);
        mediumPriorityQuery = mediumPriorityQuery.eq("project_id", filters.projectId);
        lowPriorityQuery = lowPriorityQuery.eq("project_id", filters.projectId);
      }
      
      // Apply status filter if provided
      if (filters.status && filters.status !== "all") {
        highPriorityQuery = highPriorityQuery.eq("status", filters.status);
        mediumPriorityQuery = mediumPriorityQuery.eq("status", filters.status);
        lowPriorityQuery = lowPriorityQuery.eq("status", filters.status);
      }
      
      // Apply category filter if provided
      if (filters.category && filters.category !== "all") {
        // This would need to be implemented based on how categories are stored
        // For this example, we're assuming we don't have a category field yet
      }
      
      // Execute all queries in parallel
      const [highPriority, mediumPriority, lowPriority] = await Promise.all([
        highPriorityQuery,
        mediumPriorityQuery,
        lowPriorityQuery
      ]);
      
      if (highPriority.error || mediumPriority.error || lowPriority.error) {
        throw new Error("Failed to fetch task priority statistics");
      }
      
      return [
        { 
          name: "High Priority", 
          value: highPriority.data?.length || 0, 
          color: "#f87171",
          icon: <ArrowUp className="h-4 w-4 text-red-500" />
        },
        { 
          name: "Medium Priority", 
          value: mediumPriority.data?.length || 0, 
          color: "#fb923c",
          icon: <Circle className="h-4 w-4 text-amber-500" /> 
        },
        { 
          name: "Low Priority", 
          value: lowPriority.data?.length || 0, 
          color: "#4ade80",
          icon: <ArrowDown className="h-4 w-4 text-green-500" />
        },
      ] as PriorityStats[];
    },
    refetchOnWindowFocus: false,
  });

  const total = priorityStats?.reduce((acc, item) => acc + item.value, 0) || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Task Priorities</CardTitle>
        <CardDescription>Distribution of task priorities</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-4">
            {total === 0 ? (
              <div className="flex items-center justify-center h-[100px] text-muted-foreground text-sm">
                No tasks found
              </div>
            ) : (
              <>
                {priorityStats?.map((stat, index) => (
                  <div key={stat.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-sm font-medium">{stat.name}</span>
                      </div>
                      <span className="text-sm font-medium">{stat.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
                        style={{ 
                          width: `${total ? (stat.value / total) * 100 : 0}%`,
                          backgroundColor: stat.color
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-end text-xs text-muted-foreground">
                      {total ? Math.round((stat.value / total) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
