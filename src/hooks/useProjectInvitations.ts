
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

      try {
        // No need to specify the table for project_id since we're not joining with other tables that have project_id
        const { data, error } = await supabase
          .from("project_invitations")
          .select(`
            id,
            status,
            inviter:inviter_id(id, full_name, last_name),
            invitee:invitee_id(id, full_name, last_name)
          `)
          .eq("project_id", projectId);

        if (error) {
          console.error("Error fetching project invitations:", error);
          throw error;
        }
        
        return data as unknown as ProjectInvitation[];
      } catch (error) {
        console.error("Error in project invitations query:", error);
        return [];
      }
    },
    enabled: !!projectId,
  });
};
