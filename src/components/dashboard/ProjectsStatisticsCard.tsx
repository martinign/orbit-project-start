
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        
      const { data: allProjects, error: totalError } = await supabase
        .from("projects")
        .select("status");
        
      if (activeError || pendingError || completedError || totalError) {
        throw new Error("Failed to fetch project statistics");
      }
      
      return {
        active: activeProjects?.length || 0,
        pending: pendingProjects?.length || 0,
        completed: completedProjects?.length || 0,
        total: allProjects?.length || 0
      };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Projects Overview</CardTitle>
        <CardDescription>Summary of all project statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Projects</span>
              <span className="text-xl font-bold">{projects?.total || 0}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Active</span>
                <span className="text-sm font-semibold text-green-600">{projects?.active || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{projects?.pending || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Completed</span>
                <span className="text-sm font-semibold text-blue-600">{projects?.completed || 0}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
