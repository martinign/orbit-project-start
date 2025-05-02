
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define project invitation interface without recursive types
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

      const { data, error } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          invitation_status,
          invitation_sender_id,
          invitation_recipient_id,
          profiles_sender:invitation_sender_id(id, full_name, last_name),
          profiles_recipient:invitation_recipient_id(id, full_name, last_name)
        `)
        .eq("member_project_id", projectId);

      if (error) throw error;
      
      // Transform the data to match the ProjectInvitation interface
      return (data || []).map(item => ({
        id: item.member_invitation_id,
        inviter: {
          id: item.invitation_sender_id,
          full_name: item.profiles_sender?.full_name || null,
          last_name: item.profiles_sender?.last_name || null
        },
        invitee: {
          id: item.invitation_recipient_id,
          full_name: item.profiles_recipient?.full_name || null,
          last_name: item.profiles_recipient?.last_name || null
        },
        status: item.invitation_status
      })) as ProjectInvitation[];
    },
    enabled: !!projectId,
  });
};
