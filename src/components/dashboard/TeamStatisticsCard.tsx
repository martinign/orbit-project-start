
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TeamStatisticsCardProps = {
  filters?: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  };
};

export function TeamStatisticsCard({ filters = {} }: TeamStatisticsCardProps) {
  const { data: teamStats, isLoading } = useQuery({
    queryKey: ["team_statistics", filters],
    queryFn: async () => {
      // Base query
      let activeQuery = supabase
        .from("project_team_members")
        .select("id", { count: "exact" })
        .eq("status", "active");
      
      let inactiveQuery = supabase
        .from("project_team_members")
        .select("id", { count: "exact" })
        .eq("status", "inactive");
      
      // Apply project filter if provided
      if (filters.projectId && filters.projectId !== "all") {
        activeQuery = activeQuery.eq("project_id", filters.projectId);
        inactiveQuery = inactiveQuery.eq("project_id", filters.projectId);
      }
      
      // Apply date filters if provided
      if (filters.startDate) {
        activeQuery = activeQuery.gte("updated_at", filters.startDate.toISOString());
        inactiveQuery = inactiveQuery.gte("updated_at", filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        activeQuery = activeQuery.lte("updated_at", filters.endDate.toISOString());
        inactiveQuery = inactiveQuery.lte("updated_at", filters.endDate.toISOString());
      }
      
      const [activeMembers, inactiveMembers] = await Promise.all([
        activeQuery,
        inactiveQuery
      ]);
      
      if (activeMembers.error || inactiveMembers.error) {
        throw new Error("Failed to fetch team statistics");
      }
      
      return {
        active: activeMembers.data.length,
        inactive: inactiveMembers.data.length,
        total: activeMembers.data.length + inactiveMembers.data.length
      };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Team Members</CardTitle>
        <CardDescription>Overview of project team members</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Total Members</span>
              </div>
              <span className="text-xl font-bold">{teamStats?.total || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Active</span>
                <span className="text-sm font-medium text-green-600">{teamStats?.active || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Inactive</span>
                <span className="text-sm font-medium text-gray-500">{teamStats?.inactive || 0}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
