
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsBarChart } from "../charts/ProjectsBarChart";

export function ProjectsStatisticsCard({ filters = {} }: { filters?: any }) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects_statistics", filters],
    queryFn: async () => {
      let activeQuery = supabase
        .from("projects")
        .select("status")
        .eq("status", "active");
      
      let pendingQuery = supabase
        .from("projects")
        .select("status")
        .eq("status", "pending");
        
      let completedQuery = supabase
        .from("projects")
        .select("status")
        .eq("status", "completed");
        
      let cancelledQuery = supabase
        .from("projects")
        .select("status")
        .eq("status", "cancelled");
      
      // Apply date filters if provided
      if (filters.startDate) {
        activeQuery = activeQuery.gte("updated_at", filters.startDate.toISOString());
        pendingQuery = pendingQuery.gte("updated_at", filters.startDate.toISOString());
        completedQuery = completedQuery.gte("updated_at", filters.startDate.toISOString());
        cancelledQuery = cancelledQuery.gte("updated_at", filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        activeQuery = activeQuery.lte("updated_at", filters.endDate.toISOString());
        pendingQuery = pendingQuery.lte("updated_at", filters.endDate.toISOString());
        completedQuery = completedQuery.lte("updated_at", filters.endDate.toISOString());
        cancelledQuery = cancelledQuery.lte("updated_at", filters.endDate.toISOString());
      }
      
      // Filter by specific project if provided
      if (filters.projectId && filters.projectId !== "all") {
        activeQuery = activeQuery.eq("id", filters.projectId);
        pendingQuery = pendingQuery.eq("id", filters.projectId);
        completedQuery = completedQuery.eq("id", filters.projectId);
        cancelledQuery = cancelledQuery.eq("id", filters.projectId);
      }
      
      const [activeResult, pendingResult, completedResult, cancelledResult] = await Promise.all([
        activeQuery,
        pendingQuery,
        completedQuery,
        cancelledQuery
      ]);
      
      if (activeResult.error || pendingResult.error || completedResult.error || cancelledResult.error) {
        throw new Error("Failed to fetch project statistics");
      }
      
      return [
        { name: "Active", value: activeResult.data?.length || 0, color: "#4ade80" },
        { name: "Pending", value: pendingResult.data?.length || 0, color: "#fbbf24" },
        { name: "Completed", value: completedResult.data?.length || 0, color: "#60a5fa" },
        { name: "Cancelled", value: cancelledResult.data?.length || 0, color: "#f87171" }
      ];
    },
    refetchOnWindowFocus: false,
  });

  const total = projects?.reduce((acc, item) => acc + item.value, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Projects Overview</CardTitle>
        <CardDescription>Summary of all project statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : total === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No projects data available
          </div>
        ) : (
          <div className="space-y-4">
            <ProjectsBarChart data={projects || []} />
            <div className="grid grid-cols-2 gap-3">
              <div className="grid grid-cols-2 gap-2">
                {projects?.slice(0, Math.ceil(projects.length / 2)).map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {projects?.slice(Math.ceil(projects.length / 2)).map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
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
