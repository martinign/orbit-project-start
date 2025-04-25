import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
interface TeamFilters {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}
type TeamStatisticsCardProps = {
  filters?: TeamFilters;
};
export function TeamStatisticsCard({
  filters = {}
}: TeamStatisticsCardProps) {
  const {
    data: teamStats,
    isLoading
  } = useQuery({
    queryKey: ["team_statistics", filters],
    queryFn: async () => {
      // Base query
      let activeQuery = supabase.from("project_team_members").select("id", {
        count: "exact"
      }).eq("status", "active");
      let inactiveQuery = supabase.from("project_team_members").select("id", {
        count: "exact"
      }).eq("status", "inactive");

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
      const [activeMembers, inactiveMembers] = await Promise.all([activeQuery, inactiveQuery]);
      if (activeMembers.error || inactiveMembers.error) {
        throw new Error("Failed to fetch team statistics");
      }
      return {
        active: activeMembers.data.length,
        inactive: inactiveMembers.data.length,
        total: activeMembers.data.length + inactiveMembers.data.length
      };
    },
    refetchOnWindowFocus: false
  });
  return;
}