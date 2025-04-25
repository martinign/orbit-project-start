
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

interface InvitationData {
  id: string;
  status: string;
  created_at: string;
  permission_level: string;
  project_id: string;
  inviter_id: string;
  invitee_id: string;
  projects: {
    project_number: string;
    Sponsor: string;
  } | null;
  profiles_inviter: {
    full_name: string | null;
    last_name: string | null;
  } | null;
  profiles_invitee: {
    full_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export function AllInvitationsDialog({ open, onClose, filters = {} }: AllInvitationsDialogProps) {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ["all_invitations", filters],
    queryFn: async () => {
      let query = supabase
        .from("project_invitations")
        .select(`
          id,
          status,
          created_at,
          permission_level,
          project_id,
          inviter_id,
          invitee_id,
          projects:project_id (
            project_number,
            Sponsor
          ),
          profiles_inviter:inviter_id (
            full_name,
            last_name
          ),
          profiles_invitee:invitee_id (
            full_name,
            last_name,
            email
          )
        `);

      if (filters.projectId && filters.projectId !== "all") {
        query = query.eq("project_id", filters.projectId);
      }

      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as InvitationData[];
    },
    enabled: open,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatName = (data: { full_name: string | null; last_name: string | null; } | null) => {
    if (!data) return "Unknown";
    return [data.full_name, data.last_name].filter(Boolean).join(" ") || "Unknown";
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
                  key={invitation.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {invitation.projects?.project_number} - {invitation.projects?.Sponsor}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Invitee: {formatName(invitation.profiles_invitee)}
                      </p>
                      {invitation.profiles_invitee?.email && (
                        <p className="text-sm text-muted-foreground">
                          Email: {invitation.profiles_invitee.email}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Sent by: {formatName(invitation.profiles_inviter)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={getStatusBadgeVariant(invitation.status)} className="mb-2">
                        {invitation.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        <p>Permission: {invitation.permission_level}</p>
                        <p>{format(new Date(invitation.created_at), "MMM d, yyyy")}</p>
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
