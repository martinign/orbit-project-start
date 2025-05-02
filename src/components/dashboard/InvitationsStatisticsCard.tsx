
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
    projectType?: string;
  };
}

export function InvitationsStatisticsCard({
  filters = {}
}: InvitationsStatisticsCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const {
    data: combinedStats,
    isLoading
  } = useQuery({
    queryKey: ["combined_statistics", filters],
    queryFn: async () => {
      // Query for team members
      let teamMembersQuery = supabase.from("project_team_members").select("id, project:project_id(project_type)");

      // Query for contacts
      let contactsQuery = supabase.from("project_contacts").select("id, project:project_id(project_type)");

      // Base queries for invitations - using member_project_id not project_id
      let pendingQuery = supabase.from("member_invitations").select("member_invitation_id").eq("invitation_status", "pending");
      let acceptedQuery = supabase.from("member_invitations").select("member_invitation_id").eq("invitation_status", "accepted");
      let rejectedQuery = supabase.from("member_invitations").select("member_invitation_id").eq("invitation_status", "rejected");

      // Apply project filter if provided
      if (filters.projectId && filters.projectId !== "all") {
        pendingQuery = pendingQuery.eq("member_project_id", filters.projectId);
        acceptedQuery = acceptedQuery.eq("member_project_id", filters.projectId);
        rejectedQuery = rejectedQuery.eq("member_project_id", filters.projectId);
        teamMembersQuery = teamMembersQuery.eq("project_id", filters.projectId);
        contactsQuery = contactsQuery.eq("project_id", filters.projectId);
      }

      // Apply date filters if provided
      if (filters.startDate) {
        pendingQuery = pendingQuery.gte("invitation_updated_at", filters.startDate.toISOString());
        acceptedQuery = acceptedQuery.gte("invitation_updated_at", filters.startDate.toISOString());
        rejectedQuery = rejectedQuery.gte("invitation_updated_at", filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        pendingQuery = pendingQuery.lte("invitation_updated_at", filters.endDate.toISOString());
        acceptedQuery = acceptedQuery.lte("invitation_updated_at", filters.endDate.toISOString());
        rejectedQuery = rejectedQuery.lte("invitation_updated_at", filters.endDate.toISOString());
      }
      
      const [pendingResult, acceptedResult, rejectedResult, teamMembersResult, contactsResult] = await Promise.all([pendingQuery, acceptedQuery, rejectedQuery, teamMembersQuery, contactsQuery]);
      
      if (pendingResult.error || acceptedResult.error || rejectedResult.error || teamMembersResult.error || contactsResult.error) {
        throw new Error("Failed to fetch statistics");
      }

      // Filter by project type if specified
      let pendingData = pendingResult.data;
      let acceptedData = acceptedResult.data;
      let rejectedData = rejectedResult.data;
      let teamMembersData = teamMembersResult.data;
      let contactsData = contactsResult.data;

      if (filters.projectType && filters.projectType !== "all") {
        teamMembersData = teamMembersData.filter(item => item.project?.project_type === filters.projectType);
        contactsData = contactsData.filter(item => item.project?.project_type === filters.projectType);
      }

      return {
        pending: pendingData.length,
        accepted: acceptedData.length,
        rejected: rejectedData.length,
        total: pendingData.length + acceptedData.length + rejectedData.length,
        teamMembers: teamMembersData.length,
        contacts: contactsData.length
      };
    },
    refetchOnWindowFocus: false
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
            
            {combinedStats?.total > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                size="sm"
                onClick={() => setShowDialog(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Invitations ({combinedStats.total})
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <AllInvitationsDialog open={showDialog} onClose={() => setShowDialog(false)} filters={filters} />
    </Card>
  );
}
