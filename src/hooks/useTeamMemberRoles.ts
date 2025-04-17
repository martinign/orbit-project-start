
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeamMemberRoles = () => {
  return useQuery({
    queryKey: ["team_member_roles"],
    queryFn: async () => {
      // Get all unique roles from the project_team_members table
      const { data, error } = await supabase
        .from("project_team_members")
        .select("role")
        .not("role", "is", null)
        .order("role");

      if (error) throw error;

      // Extract unique non-empty roles
      const roles = data
        .map(item => item.role)
        .filter((role): role is string => 
          typeof role === "string" && role.trim() !== ""
        );

      // Remove duplicates by converting to Set and back to Array
      const uniqueRoles = [...new Set(roles)];

      // Return as options array
      return uniqueRoles.map(role => ({
        value: role,
        label: role
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
