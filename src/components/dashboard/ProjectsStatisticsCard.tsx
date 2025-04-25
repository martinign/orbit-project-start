
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsBarChart } from "../charts/ProjectsBarChart";

export function ProjectsStatisticsCard() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects_statistics"],
    queryFn: async () => {
      const { data: activeProjects, error: activeError } = await supabase
        .from("projects")
        .select("status")
        .eq("status", "active");
      
      const { data: pendingProjects, error: pendingError } = await supabase
        .from("projects")
        .select("status")
        .eq("status", "pending");
        
      const { data: completedProjects, error: completedError } = await supabase
        .from("projects")
        .select("status")
        .eq("status", "completed");
        
      if (activeError || pendingError || completedError) {
        throw new Error("Failed to fetch project statistics");
      }
      
      return [
        { name: "Active", value: activeProjects?.length || 0, color: "#4ade80" },
        { name: "Pending", value: pendingProjects?.length || 0, color: "#fbbf24" },
        { name: "Completed", value: completedProjects?.length || 0, color: "#60a5fa" }
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
            <div className="grid grid-cols-3 gap-2">
              {projects?.map((item) => (
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
        )}
      </CardContent>
    </Card>
  );
}
