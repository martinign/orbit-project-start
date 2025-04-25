import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
export function InvitationsStatisticsCard({
  filters = {}
}: {
  filters?: any;
}) {
  const {
    data: invitationStats,
    isLoading
  } = useQuery({
    queryKey: ["invitations_statistics", filters],
    queryFn: async () => {
      // Base queries
      let pendingQuery = supabase.from("project_invitations").select("id").eq("status", "pending");
      let acceptedQuery = supabase.from("project_invitations").select("id").eq("status", "accepted");
      let rejectedQuery = supabase.from("project_invitations").select("id").eq("status", "rejected");

      // Apply project filter if provided
      if (filters.projectId && filters.projectId !== "all") {
        pendingQuery = pendingQuery.eq("project_id", filters.projectId);
        acceptedQuery = acceptedQuery.eq("project_id", filters.projectId);
        rejectedQuery = rejectedQuery.eq("project_id", filters.projectId);
      }

      // Apply date filters if provided
      if (filters.startDate) {
        pendingQuery = pendingQuery.gte("updated_at", filters.startDate.toISOString());
        acceptedQuery = acceptedQuery.gte("updated_at", filters.startDate.toISOString());
        rejectedQuery = rejectedQuery.gte("updated_at", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        pendingQuery = pendingQuery.lte("updated_at", filters.endDate.toISOString());
        acceptedQuery = acceptedQuery.lte("updated_at", filters.endDate.toISOString());
        rejectedQuery = rejectedQuery.lte("updated_at", filters.endDate.toISOString());
      }
      const [pendingResult, acceptedResult, rejectedResult] = await Promise.all([pendingQuery, acceptedQuery, rejectedQuery]);
      if (pendingResult.error || acceptedResult.error || rejectedResult.error) {
        throw new Error("Failed to fetch invitation statistics");
      }
      return {
        pending: pendingResult.data.length,
        accepted: acceptedResult.data.length,
        rejected: rejectedResult.data.length,
        total: pendingResult.data.length + acceptedResult.data.length + rejectedResult.data.length
      };
    },
    refetchOnWindowFocus: false
  });
  return;
}