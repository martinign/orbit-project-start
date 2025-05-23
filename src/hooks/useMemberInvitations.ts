
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MemberInvitation {
  member_invitation_id: string;
  invitation_sender_id: string;
  invitation_recipient_id: string;
  invitation_status: string;
  member_role: string;
  invitation_created_at: string;
  recipient_full_name?: string;
  recipient_last_name?: string;
}

export const useMemberInvitations = (projectId: string | null) => {
  return useQuery({
    queryKey: ["member_invitations", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // First, fetch the basic invitation data
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          invitation_sender_id,
          invitation_recipient_id,
          invitation_status,
          member_role,
          invitation_created_at
        `)
        .eq("member_project_id", projectId);

      if (invitationsError) {
        console.error("Error fetching invitations:", invitationsError);
        throw invitationsError;
      }
      
      if (!invitationsData || invitationsData.length === 0) {
        return [];
      }

      // Now fetch only recipient profiles - we don't need sender data anymore
      const invitations: MemberInvitation[] = await Promise.all(
        invitationsData.map(async (invitation) => {
          // Fetch recipient profile
          const { data: recipientProfile } = await supabase
            .from("profiles")
            .select("id, full_name, last_name")
            .eq("id", invitation.invitation_recipient_id)
            .single();

          // Return combined data
          return {
            ...invitation,
            recipient_full_name: recipientProfile?.full_name || "Unknown User",
            recipient_last_name: recipientProfile?.last_name || ""
          };
        })
      );
      
      console.log("Processed invitations:", invitations);
      return invitations;
    },
    enabled: !!projectId,
  });
};
