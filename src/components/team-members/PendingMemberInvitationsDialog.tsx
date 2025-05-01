
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoaderIcon } from "lucide-react";

interface PendingMemberInvitationsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface MemberInvitation {
  member_invitation_id: string;
  member_project_id: string;
  member_role: "owner" | "admin";
  invitation_created_at: string;
  invitation_sender_id: string;
  project?: {
    project_number: string;
    Sponsor: string;
  } | null;
}

interface MemberInvitationWithSenderName extends MemberInvitation {
  inviterName?: string;
}

export const PendingMemberInvitationsDialog = ({ open, onClose }: PendingMemberInvitationsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: allInvitations, isLoading: isLoadingInvitations } = useQuery({ 
    queryKey: ["pending_member_invitations"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          member_project_id,
          member_role,
          invitation_created_at,
          invitation_sender_id,
          project:member_project_id(
            project_number,
            Sponsor
          )
        `)
        .eq("invitation_recipient_id", user.user.id)
        .eq("invitation_status", "pending")
        .order("invitation_created_at", { ascending: false });

      if (error) throw error;
      return data as MemberInvitation[];
    },
    enabled: open,
  });

  // Process invitations to show each project only once
  const uniqueInvitationsByProject = useMemo(() => {
    if (!allInvitations) return [];
    const seenProjects = new Set<string>();
    return allInvitations.filter((invitation) => {
      if (seenProjects.has(invitation.member_project_id)) {
        return false;
      }
      seenProjects.add(invitation.member_project_id);
      return true;
    });
  }, [allInvitations]);

  const { data: senderProfiles } = useQuery({
    queryKey: ["sender_profiles", uniqueInvitationsByProject.map((inv) => inv.invitation_sender_id).filter(Boolean)],
    queryFn: async () => {
      if (!uniqueInvitationsByProject.length) return {};
      const inviterIds = uniqueInvitationsByProject.map((inv) => inv.invitation_sender_id).filter(Boolean);
      if (inviterIds.length === 0) return {};

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, last_name")
        .in("id", inviterIds);

      if (error) {
        console.error("Error fetching sender profiles:", error);
        return {};
      }
      return data.reduce((acc, profile) => ({ ...acc, [profile.id]: `${profile.full_name} ${profile.last_name}` }), {});
    },
    enabled: open && !!uniqueInvitationsByProject.length,
  });

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    try {
      setLoading(invitationId);
      const invitationToHandle = allInvitations?.find((inv) => inv.member_invitation_id === invitationId);
      if (!invitationToHandle) {
        throw new Error("Invitation not found");
      }

      const { error: updateError } = await supabase
        .from("member_invitations")
        .update({ invitation_status: accept ? "accepted" : "cancelled" })
        .eq("member_invitation_id", invitationId);

      if (updateError) throw updateError;

      if (accept) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("User not found");

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, last_name, location")
          .eq("id", user.user.id)
          .single();

        const { error: teamMemberError } = await supabase
          .from("project_team_members")
          .insert({
            project_id: invitationToHandle.member_project_id,
            user_id: user.user.id,
            full_name: profile?.full_name || "Unnamed User",
            last_name: profile?.last_name || "Unnamed User",
            location: profile?.location
          });

        if (teamMemberError) throw teamMemberError;
      }

      queryClient.invalidateQueries({ queryKey: ["pending_member_invitations"] });
      queryClient.invalidateQueries({ queryKey: ["pending_member_invitations_count"] });
      queryClient.invalidateQueries({ queryKey: ["sender_profiles"] });
      if (accept) {
        queryClient.invalidateQueries({ queryKey: ["team_members"] });
      }

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Rejected",
        description: accept
          ? "You have been added to the project team."
          : "The invitation has been cancelled.",
      });

      if ((allInvitations?.length || 0) <= 1) {
        onClose();
      }
    } catch (error: any) {
      console.error("Error handling invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const isLoadingCombined = isLoadingInvitations || !senderProfiles;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pending Invitations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoadingCombined ? (
            <div className="text-center py-4">Loading invitations...</div>
          ) : !allInvitations || allInvitations.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-4">
              {uniqueInvitationsByProject.map((invitation) => (
                <div
                  key={invitation.member_invitation_id}
                  className="flex flex-col space-y-2 p-4 border rounded-lg"
                >
                  <div className="font-medium">
                    {invitation.project ?
                      `${invitation.project.project_number} - ${invitation.project.Sponsor}` :
                      "Unknown Project"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Role: {invitation.member_role === "owner" ? "Owner" : "Admin"}
                  </div>
                  {invitation.invitation_sender_id && senderProfiles?.[invitation.invitation_sender_id] && (
                    <div className="text-sm text-muted-foreground">
                      Sent by: {senderProfiles[invitation.invitation_sender_id]}
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleInvitation(invitation.member_invitation_id, false)}
                      disabled={!!loading}
                    >
                      {loading === invitation.member_invitation_id ? (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleInvitation(invitation.member_invitation_id, true)}
                      disabled={!!loading}
                    >
                      {loading === invitation.member_invitation_id ? (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
