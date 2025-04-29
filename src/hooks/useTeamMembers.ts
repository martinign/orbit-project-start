
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  last_name: string;
  role?: string; // This represents the permission (owner, admin, edit, read)
  project_id: string;
  projects?: {
    project_number: string;
    Sponsor: string;
  };
}

export const useTeamMembers = (projectId?: string) => {
  return useQuery({
    queryKey: ["team_members", projectId],
    queryFn: async () => {
      const query = supabase
        .from("project_team_members")
        .select(`
          id, 
          user_id,
          full_name, 
          last_name,
          role, 
          project_id,
          projects:project_id(
            project_number,
            Sponsor
          )
        `)
        // Only select team members with a user_id (authenticated users)
        .not('user_id', 'is', null);

      // Add project filtering if project ID is provided
      if (projectId) {
        query.eq("project_id", projectId);
      }

      query.order("full_name");

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useTeamMemberName = (memberId?: string | null) => {
  const { data: teamMembers, isLoading } = useTeamMembers();

  if (!memberId) return { memberName: null, isLoading };

  const member = teamMembers?.find((m) => m.id === memberId);
  return { memberName: member?.full_name || null, isLoading };
};
