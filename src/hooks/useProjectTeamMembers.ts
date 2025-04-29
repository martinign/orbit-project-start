
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectTeamMembers = (projectId?: string) => {
  return useQuery({
    queryKey: ['project_team_members_and_invitations', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      try {
        // Explicitly reference project_invitations table for project_id
        const { data: invitations, error: invitationsError } = await supabase
          .from('project_invitations')
          .select('inviter_id, invitee_id, status, permission_level')
          .eq('project_id', projectId);

        if (invitationsError) {
          console.error("Error fetching project invitations:", invitationsError);
          throw invitationsError;
        }

        if (!invitations.length) return [];

        const userIds = new Set([
          ...invitations.map(inv => inv.inviter_id),
          ...invitations.map(inv => inv.invitee_id)
        ]);

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, last_name')
          .in('id', Array.from(userIds));

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }

        const userMap = new Map();
        invitations.forEach((invitation) => {
          const inviter = profiles.find(p => p.id === invitation.inviter_id);
          const invitee = profiles.find(p => p.id === invitation.invitee_id);

          if (inviter) {
            userMap.set(inviter.id, {
              ...inviter,
              role: 'Inviter',
              permission_level: invitation.permission_level
            });
          }
          if (invitee && invitation.status === 'accepted') {
            userMap.set(invitee.id, {
              ...invitee,
              role: 'Invitee',
              permission_level: invitation.permission_level
            });
          }
        });

        return Array.from(userMap.values());
      } catch (error) {
        console.error("Error in team members and invitations query:", error);
        return [];
      }
    },
    enabled: !!projectId
  });
};

export const useTeamMemberName = (memberId?: string | null) => {
  const { data: teamMembers, isLoading } = useProjectTeamMembers();

  if (!memberId) return { memberName: null, isLoading };

  const member = teamMembers?.find((m) => m.id === memberId);
  return { memberName: member?.full_name || null, isLoading };
};
