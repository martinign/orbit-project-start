
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Users, Contact } from "lucide-react";
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

  const { data: combinedStats, isLoading } = useQuery({
    queryKey: ["combined_statistics", filters],
    queryFn: async () => {
      // Query for team members
      let teamMembersQuery = supabase
        .from("project_team_members")
        .select("id", { count: "exact" });
      
      // Query for contacts
      let contactsQuery = supabase
        .from("project_contacts")
        .select("id", { count: "exact" });

      // Base queries for invitations
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
        teamMembersQuery = teamMembersQuery.eq("project_id", filters.projectId);
        contactsQuery = contactsQuery.eq("project_id", filters.projectId);
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
      
      const [
        pendingResult, 
        acceptedResult, 
        rejectedResult,
        teamMembersResult,
        contactsResult
      ] = await Promise.all([
        pendingQuery,
        acceptedQuery,
        rejectedQuery,
        teamMembersQuery,
        contactsQuery
      ]);
      
      if (pendingResult.error || acceptedResult.error || rejectedResult.error || 
          teamMembersResult.error || contactsResult.error) {
        throw new Error("Failed to fetch statistics");
      }
      
      return {
        pending: pendingResult.data.length,
        accepted: acceptedResult.data.length,
        rejected: rejectedResult.data.length,
        total: pendingResult.data.length + acceptedResult.data.length + rejectedResult.data.length,
        teamMembers: teamMembersResult.data.length,
        contacts: contactsResult.data.length
      };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Team Overview</CardTitle>
            <CardDescription>Team members, contacts & invitations</CardDescription>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Team Members</span>
              </div>
              <span className="text-xl font-bold">{combinedStats?.teamMembers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contact className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Contacts</span>
              </div>
              <span className="text-xl font-bold">{combinedStats?.contacts || 0}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Invitations</span>
                <span className="text-xl font-bold">{combinedStats?.total || 0}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">{combinedStats?.pending || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Accepted</span>
                  <span className="text-sm font-medium text-green-600">{combinedStats?.accepted || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Rejected</span>
                  <span className="text-sm font-medium text-red-600">{combinedStats?.rejected || 0}</span>
                </div>
              </div>
            </div>
            {combinedStats?.total > 0 && (
              <Button 
                variant="default"
                className="w-full mt-4 bg-primary text-white hover:bg-primary/90" 
                onClick={() => setShowDialog(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Invitations
              </Button>
            )}
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
