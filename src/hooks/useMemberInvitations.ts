
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MemberInvitation {
  member_invitation_id: string;
  member_project_id: string;
  invitation_sender_id: string;
  invitation_recipient_id: string;
  member_role: "owner" | "admin";
  invitation_status: "pending" | "accepted" | "cancelled";
  invitation_created_at: string;
  invitation_updated_at: string;
  sender_profile?: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  };
  recipient_profile?: {
    id: string;
    full_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  project?: {
    project_number: string;
    Sponsor: string;
  };
}

export const useMemberInvitations = (projectId: string | null) => {
  return useQuery({
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
          invitation_updated_at,
          sender_profile:invitation_sender_id(id, full_name, last_name),
          recipient_profile:invitation_recipient_id(id, full_name, last_name, email),
          project:member_project_id(project_number, Sponsor)
        `)
        .eq("member_project_id", projectId);

      if (error) throw error;
      return data as unknown as MemberInvitation[];
    },
    enabled: !!projectId,
  });
};

export const usePendingInvitationsCount = () => {
  const { data: count = 0, refetch } = useQuery({
    queryKey: ["pending_member_invitations_count"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      const { count, error } = await supabase
        .from("member_invitations")
        .select("*", { count: "exact", head: true })
        .eq("invitation_recipient_id", user.user.id)
        .eq("invitation_status", "pending");

      if (error) {
        console.error("Error fetching invitations count:", error);
        return 0;
      }

      return count || 0;
    },
  });

  return { count, refetch };
};
