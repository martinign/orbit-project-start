
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, Circle, ArrowDown } from "lucide-react";

interface TaskPrioritiesFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  projectType?: string;
  showNewTasks?: boolean;
}

interface TaskPrioritiesCardProps {
  filters?: TaskPrioritiesFilters;
}

export function TaskPrioritiesCard({ filters = {} }: TaskPrioritiesCardProps) {
  const { data: priorityStats, isLoading } = useQuery({
    queryKey: ["task_priorities", filters],
    queryFn: async () => {
      const priorities = filters.priority && filters.priority !== "all" 
        ? [filters.priority] 
        : ["high", "medium", "low"];
      
      const queryResults = [];
      
      for (const priority of priorities) {
        let query = supabase
          .from("project_tasks")
          .select("id, project:project_id(project_type)")
          .eq("priority", priority);
          
        if (filters.projectId && filters.projectId !== "all") {
          query = query.eq("project_id", filters.projectId);
        }
        
        if (filters.status && filters.status !== "all") {
          query = query.eq("status", filters.status);
        }

        if (filters.showNewTasks) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          query = query.gte("created_at", yesterday.toISOString());
        }
        
        const result = await query;
        queryResults.push(result);
      }
      
      if (queryResults.some(result => result.error)) {
        throw new Error("Failed to fetch task priority statistics");
      }

      // Filter by project type if specified
      let filteredResults = queryResults.map(result => result.data || []);
      
      if (filters.projectType && filters.projectType !== "all") {
        filteredResults = filteredResults.map(resultData => 
          resultData.filter(task => task.project?.project_type === filters.projectType)
        );
      }

      // Map priorities to their display configuration
      const priorityConfig = {
        high: { 
          name: "High Priority", 
          color: "#f87171",
          icon: <ArrowUp className="h-4 w-4 text-red-500" />
        },
        medium: { 
          name: "Medium Priority", 
          color: "#fb923c",
          icon: <Circle className="h-4 w-4 text-amber-500" />
        },
        low: { 
          name: "Low Priority", 
          color: "#4ade80",
          icon: <ArrowDown className="h-4 w-4 text-green-500" />
        }
      };
      
      return priorities.map((priority, index) => ({
        name: priorityConfig[priority as keyof typeof priorityConfig].name,
        value: filteredResults[index]?.length || 0,
        color: priorityConfig[priority as keyof typeof priorityConfig].color,
        icon: priorityConfig[priority as keyof typeof priorityConfig].icon
      }));
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
                {priorityStats?.map((stat) => (
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
