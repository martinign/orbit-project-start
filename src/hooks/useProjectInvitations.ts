
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectInvitation {
  id: string;
  inviter: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  };
  invitee: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  };
  status: string;
}

export const useProjectInvitations = (projectId: string | null) => {
  return useQuery({
    queryKey: ["member_invitations_with_profiles", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // First, get the invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          invitation_status,
          invitation_sender_id,
          invitation_recipient_id
        `)
        .eq("member_project_id", projectId);

      if (invitationsError) throw invitationsError;
      if (!invitationsData || invitationsData.length === 0) return [];

      // Extract user IDs for inviters and invitees
      const userIds = [
        ...invitationsData.map(inv => inv.invitation_sender_id),
        ...invitationsData.map(inv => inv.invitation_recipient_id)
      ].filter(Boolean);

      // Get user profiles for all user IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, last_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a mapping of user IDs to profiles
      const profilesMap = (profiles || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});

      // Format the data as expected by the interface
      const formattedInvitations = invitationsData.map(invitation => ({
        id: invitation.member_invitation_id,
        inviter: profilesMap[invitation.invitation_sender_id] || { id: invitation.invitation_sender_id, full_name: null, last_name: null },
        invitee: profilesMap[invitation.invitation_recipient_id] || { id: invitation.invitation_recipient_id, full_name: null, last_name: null },
        status: invitation.invitation_status
      }));

      return formattedInvitations as ProjectInvitation[];
    },
    enabled: !!projectId,
  });
};
