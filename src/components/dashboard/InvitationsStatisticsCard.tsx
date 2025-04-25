
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function InvitationsStatisticsCard() {
  const { data: invitationStats, isLoading } = useQuery({
    queryKey: ["invitations_statistics"],
    queryFn: async () => {
      // Get pending invitations
      const { data: pendingInvitations, error: pendingError } = await supabase
        .from("project_invitations")
        .select("id")
        .eq("status", "pending");
      
      if (pendingError) throw pendingError;

      // Get accepted invitations
      const { data: acceptedInvitations, error: acceptedError } = await supabase
        .from("project_invitations")
        .select("id")
        .eq("status", "accepted");
      
      if (acceptedError) throw acceptedError;

      // Get rejected invitations
      const { data: rejectedInvitations, error: rejectedError } = await supabase
        .from("project_invitations")
        .select("id")
        .eq("status", "rejected");
      
      if (rejectedError) throw rejectedError;
      
      return {
        pending: pendingInvitations.length,
        accepted: acceptedInvitations.length,
        rejected: rejectedInvitations.length,
        total: pendingInvitations.length + acceptedInvitations.length + rejectedInvitations.length
      };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Invitations Status</CardTitle>
        <CardDescription>Overview of project invitations</CardDescription>
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
            {invitationStats?.pending > 0 && (
              <div className="pt-1 text-xs text-yellow-600 flex items-center">
                <Bell className="h-3 w-3 mr-1" />
                {invitationStats.pending} pending {invitationStats.pending === 1 ? 'invitation' : 'invitations'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
