
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface AllMemberInvitationsDialogProps {
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
  member_role: string;
  profiles_recipient: {
    full_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export function AllMemberInvitationsDialog({ open, onClose, filters = {} }: AllMemberInvitationsDialogProps) {
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
          profiles_recipient:invitation_recipient_id (
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "revoked":
        return <Badge variant="outline" className="border-red-500 text-red-500">Revoked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatName = (data: { full_name: string | null; last_name: string | null; email: string | null } | null) => {
    if (!data) return "Unknown";
    const name = [data.full_name, data.last_name].filter(Boolean).join(" ").trim();
    return name || data.email || "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>All Invitations</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !invitations || invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No invitations found
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.member_invitation_id}>
                    <TableCell className="font-medium">
                      {formatName(invitation.profiles_recipient)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invitation.invitation_status)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {invitation.member_role}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(invitation.invitation_created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
