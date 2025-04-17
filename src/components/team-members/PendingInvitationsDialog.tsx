
import { useState } from "react";
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
  permission_level: string;
  created_at: string;
  projects: {
    project_number: string;
    Sponsor: string;
  };
}

export const PendingInvitationsDialog = ({ open, onClose }: PendingInvitationsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["pending_invitations"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("project_invitations")
        .select(`
          id,
          project_id,
          permission_level,
          created_at,
          projects:project_id (
            project_number,
            Sponsor
          )
        `)
        .eq("invitee_id", user.user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invitation[];
    },
    enabled: open,
  });

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    try {
      setLoading(invitationId);
      const { data: invitation } = await supabase
        .from("project_invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from("project_invitations")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      // If accepted, add user to project team members
      if (accept) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("User not found");

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, location")
          .eq("id", user.user.id)
          .single();

        const { error: teamMemberError } = await supabase
          .from("project_team_members")
          .insert({
            project_id: invitation.project_id,
            user_id: user.user.id,
            full_name: profile?.full_name || "Unnamed User",
            location: profile?.location,
            permission_level: invitation.permission_level,
          });

        if (teamMemberError) throw teamMemberError;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["pending_invitations"] });
      queryClient.invalidateQueries({ queryKey: ["pending_invitations_count"] });
      if (accept) {
        queryClient.invalidateQueries({ queryKey: ["team_members"] });
      }

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Rejected",
        description: accept 
          ? "You have been added to the project team."
          : "The invitation has been rejected.",
      });

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pending Invitations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center py-4">Loading invitations...</div>
          ) : !invitations || invitations.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col space-y-2 p-4 border rounded-lg"
                >
                  <div className="font-medium">
                    {invitation.projects.project_number} - {invitation.projects.Sponsor}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Permission Level: {invitation.permission_level}
                  </div>
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
