import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AllInvitationsDialog } from "./AllInvitationsDialog";

interface InvitationsStatisticsCardProps {
  filters?: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  };
}

export function InvitationsStatisticsCard({ filters = {} }: InvitationsStatisticsCardProps) {
  const [showDialog, setShowDialog] = useState(false);

  const { data: invitationStats, isLoading } = useQuery({
    queryKey: ["invitations_statistics", filters],
    queryFn: async () => {
      // Base queries
      let pendingQuery = supabase
        .from("project_invitations")
        .select("id")
        .eq("status", "pending");
      
      let acceptedQuery = supabase
        .from("project_invitations")
        .select("id")
        .eq("status", "accepted");
      
      let rejectedQuery = supabase
        .from("project_invitations")
        .select("id")
        .eq("status", "rejected");
        
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
      
      const [pendingResult, acceptedResult, rejectedResult] = await Promise.all([
        pendingQuery,
        acceptedQuery,
        rejectedQuery
      ]);
      
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
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Invitations Status</CardTitle>
            <CardDescription>Overview of project invitations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Invitations</span>
              <span className="text-xl font-bold">{invitationStats?.total || 0}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{invitationStats?.pending || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Accepted</span>
                <span className="text-sm font-medium text-green-600">{invitationStats?.accepted || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Rejected</span>
                <span className="text-sm font-medium text-red-600">{invitationStats?.rejected || 0}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4" // Increased margin-top for more visibility
              onClick={() => setShowDialog(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Invitations
            </Button>
          </div>
        )}
      </CardContent>
      <AllInvitationsDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        filters={filters}
      />
    </Card>
  );
}
