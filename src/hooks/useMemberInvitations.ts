
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MemberInvitation {
  member_invitation_id: string;
  invitation_sender: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  };
  invitation_recipient: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  };
  invitation_status: string;
  member_role: string;
}

export const useMemberInvitations = (projectId: string | null) => {
  return useQuery({
    queryKey: ["member_invitations_with_profiles", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          invitation_status,
          member_role,
          invitation_sender:invitation_sender_id(id, full_name, last_name),
          invitation_recipient:invitation_recipient_id(id, full_name, last_name)
        `)
        .eq("member_project_id", projectId);

      if (error) throw error;
      return data as unknown as MemberInvitation[];
    },
    enabled: !!projectId,
  });
};
