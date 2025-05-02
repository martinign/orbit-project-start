
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

      const { data, error } = await supabase
        .from("member_invitations")
        .select(`
          id,
          status,
          inviter:inviter_id(id, full_name, last_name),
          invitee:invitee_id(id, full_name, last_name)
        `)
        .eq("project_id", projectId);

      if (error) throw error;
      return data as unknown as ProjectInvitation[];
    },
    enabled: !!projectId,
  });
};
