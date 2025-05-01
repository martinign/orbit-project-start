
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AllInvitationsDialogProps {
  open: boolean;
  onClose: () => void;
  filters?: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  };
}

interface MemberInvitationData {
  member_invitation_id: string;
  invitation_status: string;
  invitation_created_at: string;
  member_role: "owner" | "admin";
  member_project_id: string;
  invitation_sender_id: string;
  invitation_recipient_id: string;
  project?: {
    project_number: string;
    Sponsor: string;
  } | null;
  sender_profile?: {
    full_name: string | null;
    last_name: string | null;
  } | null;
  recipient_profile?: {
    full_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export function AllInvitationsDialog({ open, onClose, filters = {} }: AllInvitationsDialogProps) {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ["all_member_invitations", filters],
    queryFn: async () => {
      let query = supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          invitation_status,
          invitation_created_at,
          member_role,
          member_project_id,
          invitation_sender_id,
          invitation_recipient_id,
          project:member_project_id (
            project_number,
            Sponsor
          ),
          sender_profile:invitation_sender_id (
            full_name,
            last_name
          ),
          recipient_profile:invitation_recipient_id (
            full_name,
            last_name,
            email
          )
        `);

      if (filters.projectId && filters.projectId !== "all") {
        query = query.eq("member_project_id", filters.projectId);
      }

      if (filters.startDate) {
        query = query.gte("invitation_created_at", filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte("invitation_created_at", filters.endDate.toISOString());
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("invitation_status", filters.status);
      }

      const { data, error } = await query.order("invitation_created_at", { ascending: false });
      
      if (error) throw error;
      
      return data as unknown as MemberInvitationData[];
    },
    enabled: open,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatName = (data: { full_name: string | null; last_name: string | null; } | null) => {
    if (!data) return "Unknown";
    return [data.full_name, data.last_name].filter(Boolean).join(" ") || "Unknown";
  };

  // Helper function to make role more readable
  const formatRole = (role: string): string => {
    switch(role) {
      case "owner": return "Owner";
      case "admin": return "Admin";
      default: return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Invitations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : !invitations || invitations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No invitations found</p>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.member_invitation_id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {invitation.project?.project_number} - {invitation.project?.Sponsor}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Invitee: {formatName(invitation.recipient_profile)}
                      </p>
                      {invitation.recipient_profile?.email && (
                        <p className="text-sm text-muted-foreground">
                          Email: {invitation.recipient_profile.email}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Sent by: {formatName(invitation.sender_profile)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={getStatusBadgeVariant(invitation.invitation_status)} className="mb-2">
                        {invitation.invitation_status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        <p>Role: {formatRole(invitation.member_role)}</p>
                        <p>{format(new Date(invitation.invitation_created_at), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
