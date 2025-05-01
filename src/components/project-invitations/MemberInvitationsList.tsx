
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoaderIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MemberInvitation } from "@/hooks/useMemberInvitations";

interface MemberInvitationsListProps {
  projectId: string | null;
}

const MemberInvitationsList = ({ projectId }: MemberInvitationsListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["member_invitations", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          member_project_id,
          invitation_sender_id,
          invitation_recipient_id,
          member_role,
          invitation_status,
          invitation_created_at,
          recipient_profile:invitation_recipient_id(
            full_name,
            last_name,
            email
          )
        `)
        .eq("member_project_id", projectId)
        .order("invitation_created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as MemberInvitation[];
    },
    enabled: !!projectId,
  });

  const updateRole = useMutation({
    mutationFn: async ({ 
      id, 
      member_role 
    }: { 
      id: string; 
      member_role: "owner" | "admin" 
    }) => {
      const { error } = await supabase
        .from("member_invitations")
        .update({ member_role })
        .eq("member_invitation_id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member_invitations", projectId] });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
      console.error("Error updating role:", error);
    },
  });

  const handleRoleChange = (invitationId: string, newRole: "owner" | "admin") => {
    updateRole.mutate({ id: invitationId, member_role: newRole });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "accepted":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoaderIcon className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invitations for this project
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div
          key={invitation.member_invitation_id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="space-y-2">
            <div className="font-medium">
              {invitation.recipient_profile
                ? `${invitation.recipient_profile.full_name || ''} ${invitation.recipient_profile.last_name || ''}`.trim()
                : "Unnamed User"}
            </div>
            <div className="text-sm text-muted-foreground">
              {invitation.recipient_profile?.email}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(invitation.invitation_status)}>
                {invitation.invitation_status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Select
                value={invitation.member_role}
                onValueChange={(value: "owner" | "admin") => 
                  handleRoleChange(invitation.member_invitation_id, value)
                }
                disabled={invitation.invitation_status !== "pending"}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberInvitationsList;
