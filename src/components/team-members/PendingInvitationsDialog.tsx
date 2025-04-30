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

export const PendingInvitationsDialog = ({ open, onClose }: PendingInvitationsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: allInvitations, isLoading: isLoadingInvitations } = useQuery({
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
          inviter_id,
          projects:project_id (
            project_number,
            Sponsor
          )
        `)
        .eq("invitee_id", user.user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InvitationWithInviterId[];
    },
    enabled: open,
  });

  // Deduplicate by project
  const uniqueInvitationsByProject = useMemo(() => {
    if (!allInvitations) return [];
    const seen = new Set<string>();
    return allInvitations.filter(inv => {
      if (seen.has(inv.project_id)) return false;
      seen.add(inv.project_id);
      return true;
    });
  }, [allInvitations]);

  const { data: senderProfiles } = useQuery({
    queryKey: ["sender_profiles", uniqueInvitationsByProject.map(inv => inv.inviter_id)],
    queryFn: async () => {
      if (!uniqueInvitationsByProject.length) return {};
      const inviterIds = uniqueInvitationsByProject.map(inv => inv.inviter_id).filter(Boolean);
      if (!inviterIds.length) return {};

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, last_name")
        .in("id", inviterIds);

      if (error) {
        console.error("Error fetching sender profiles:", error);
        return {};
      }

      return data.reduce((acc, p) => ({ ...acc, [p.id]: `${p.full_name} ${p.last_name}` }), {} as Record<string, string>);
    },
    enabled: open && uniqueInvitationsByProject.length > 0,
  });

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    try {
      setLoading(invitationId);
      const invitation = allInvitations?.find(inv => inv.id === invitationId);
      if (!invitation) throw new Error("Invitation not found");

      // Update invitation status without ambiguous RETURNING
      const { error: updateError } = await supabase
        .from("project_invitations")
        .update(
          { status: accept ? "accepted" : "rejected" },
          { returning: "minimal" }
        )
        .eq("id", invitationId);
      if (updateError) throw updateError;

      if (accept) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("User not authenticated");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, last_name, location")
          .eq("id", user.user.id)
          .single();
        if (profileError) throw profileError;

        // Insert team member without returning extra columns
        const { error: memberError } = await supabase
          .from("project_team_members")
          .insert(
            {
              project_id: invitation.project_id,
              user_id: user.user.id,
              full_name: profile.full_name || "Unnamed User",
              last_name: profile.last_name || "Unnamed User",
              location: profile.location,
              permission_level: invitation.permission_level,
            },
            { returning: "minimal" }
          );
        if (memberError) throw memberError;
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["pending_invitations"] });
      queryClient.invalidateQueries({ queryKey: ["pending_invitations_count"] });
      queryClient.invalidateQueries({ queryKey: ["sender_profiles"] });
      if (accept) queryClient.invalidateQueries({ queryKey: ["team_members"] });

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Rejected",
        description: accept
          ? "You have been added to the project team."
          : "The invitation has been rejected.",
      });

      // Close if last
      if ((allInvitations?.length ?? 0) <= 1) onClose();
    } catch (err: any) {
      console.error("Error handling invitation:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to process invitation",
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
              {uniqueInvitationsByProject.map(inv => (
                <div
                  key={inv.id}
                  className="flex flex-col space-y-2 p-4 border rounded-lg"
                >
                  <div className="font-medium">
                    {inv.projects
                      ? `${inv.projects.project_number} - ${inv.projects.Sponsor}`
                      : "Unknown Project"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Permission Level: {inv.permission_level}
                  </div>
                  {inv.inviter_id && senderProfiles?.[inv.inviter_id] && (
                    <div className="text-sm text-muted-foreground">
                      Sent by: {senderProfiles[inv.inviter_id]}
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleInvitation(inv.id, false)}
                      disabled={!!loading}
                    >
                      {loading === inv.id && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />} Reject
                    </Button>
                    <Button
                      onClick={() => handleInvitation(inv.id, true)}
                      disabled={!!loading}
                    >
                      {loading === inv.id && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />} Accept
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
