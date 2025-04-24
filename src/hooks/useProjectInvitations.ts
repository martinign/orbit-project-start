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
    queryKey: ["project_invitations_with_profiles", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("project_invitations")
        .select(`
          id,
          status,
          inviter:inviter_id(id, full_name, last_name),
          invitee:invitee_id(id, full_name, last_name)
        `)
        .eq("project_id", projectId);

      if (error) throw error;

      // Concatenate full_name and last_name
      const invitations = data.map((invitation) => ({
        ...invitation,
        inviter: {
          ...invitation.inviter,
          full_name: `${invitation.inviter.full_name} ${invitation.inviter.last_name}`,
        },
        invitee: {
          ...invitation.invitee,
          full_name: `${invitation.invitee.full_name} ${invitation.invitee.last_name}`,
        },
      }));

      return invitations as ProjectInvitation[];
    },
    enabled: !!projectId,
  });
};
