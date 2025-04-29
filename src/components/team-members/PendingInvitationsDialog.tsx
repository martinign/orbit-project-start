import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoaderIcon } from "lucide-react";

interface PendingInvitationsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Invitation {
  id: string;
  project_id: string;
  permission_level: "owner" | "admin" | "edit" | "read_only";
  created_at: string;
  projects: {
    project_number: string;
    Sponsor: string;
  } | null;
}

interface InvitationWithInviterId extends Invitation {
  inviter_id: string;
}

interface InvitationWithSenderName extends InvitationWithInviterId {
  inviterName?: string;
}

export const PendingInvitationsDialog = ({ open, onClose }: PendingInvitationsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: allInvitations, isLoading: isLoadingInvitations } = useQuery({ 
    queryKey: ["pending_invitations"],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];

        // Fix: Using a different approach for the join that explicitly specifies the projects table
        const { data, error } = await supabase
          .from("project_invitations")
          .select(`
            id,
            project_id,
            permission_level,
            created_at,
            inviter_id,
            projects:projects!project_invitations_project_id_fkey (
              project_number,
              Sponsor
            )
          `)
          .eq("invitee_id", user.user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching invitations:", error);
          throw error;
        }
        
        return (data || []) as InvitationWithInviterId[];
      } catch (error) {
        console.error("Error in pending invitations query:", error);
        return [];
      }
    },
    enabled: open,
  });

  // Process invitations to show each project only once
  const uniqueInvitationsByProject = useMemo(() => {
    if (!allInvitations) return [];
    const seenProjects = new Set<string>();
    return allInvitations.filter((invitation) => {
      if (seenProjects.has(invitation.project_id)) {
        return false;
      }
      seenProjects.add(invitation.project_id);
      return true;
    });
  }, [allInvitations]);

  const { data: senderProfiles } = useQuery({
    queryKey: ["sender_profiles", uniqueInvitationsByProject.map((inv) => inv.inviter_id).filter(Boolean)],
    queryFn: async () => {
      if (!uniqueInvitationsByProject.length) return {};
      const inviterIds = uniqueInvitationsByProject.map((inv) => inv.inviter_id).filter(Boolean);
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
      const invitationToHandle = allInvitations?.find((inv) => inv.id === invitationId);
      if (!invitationToHandle) {
        throw new Error("Invitation not found");
      }

      const { error: updateError } = await supabase
        .from("project_invitations")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      if (accept) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("User not found");

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, last_name, location")
          .eq("id", user.user.id)
          .single();

        // Using 'role' instead of 'permission_level' in project_team_members
        // permission_level from project_invitations is stored as role in project_team_members
        const { error: teamMemberError } = await supabase
          .from("project_team_members")
          .insert({
            project_id: invitationToHandle.project_id,
            user_id: user.user.id,
            full_name: profile?.full_name || "Unnamed User",
            last_name: profile?.last_name || "Unnamed User",
            role: invitationToHandle.permission_level // Use permission_level from invitation as role
          });

        if (teamMemberError) throw teamMemberError;
      }

      queryClient.invalidateQueries({ queryKey: ["pending_invitations"] });
      queryClient.invalidateQueries({ queryKey: ["pending_invitations_count"] });
      queryClient.invalidateQueries({ queryKey: ["sender_profiles"] });
      if (accept) {
        queryClient.invalidateQueries({ queryKey: ["team_members"] });
      }

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Rejected",
        description: accept
          ? "You have been added to the project team."
          : "The invitation has been rejected.",
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
                  key={invitation.id}
                  className="flex flex-col space-y-2 p-4 border rounded-lg"
                >
                  <div className="font-medium">
                    {invitation.projects ?
                      `${invitation.projects.project_number} - ${invitation.projects.Sponsor}` :
                      "Unknown Project"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Permission Level: {invitation.permission_level}
                  </div>
                  {invitation.inviter_id && senderProfiles?.[invitation.inviter_id] && (
                    <div className="text-sm text-muted-foreground">
                      Sent by: {senderProfiles[invitation.inviter_id]}
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleInvitation(invitation.id, false)}
                      disabled={!!loading}
                    >
                      {loading === invitation.id ? (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleInvitation(invitation.id, true)}
                      disabled={!!loading}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {loading === invitation.id ? (
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

export default PendingInvitationsDialog;
