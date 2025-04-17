
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  full_name: string;
}

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_team_members")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useTeamMemberName = (memberId?: string | null) => {
  const { data: teamMembers, isLoading } = useTeamMembers();

  if (!memberId) return { memberName: null, isLoading };

  const member = teamMembers?.find((m) => m.id === memberId);
  return { memberName: member?.full_name || null, isLoading };
};
