
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectTeamMembers = (projectId?: string) => {
  return useQuery({
    queryKey: ['project_team_members_and_invitations', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data: invitations, error: invitationsError } = await supabase
        .from('project_invitations')
        .select('inviter_id, invitee_id, status')
        .eq('project_id', projectId);

      if (invitationsError) throw invitationsError;

      const userIds = new Set([
        ...invitations.map(inv => inv.inviter_id),
        ...invitations.map(inv => inv.invitee_id)
      ]);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, last_name')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      const userMap = new Map();
      invitations.forEach((invitation) => {
        const inviter = profiles.find(p => p.id === invitation.inviter_id);
        const invitee = profiles.find(p => p.id === invitation.invitee_id);

        if (inviter) {
          userMap.set(inviter.id, {
            ...inviter,
            role: 'Inviter'
          });
        }
        if (invitee && invitation.status === 'accepted') {
          userMap.set(invitee.id, {
            ...invitee,
            role: 'Invitee'
          });
        }
      });

      return Array.from(userMap.values());
    },
    enabled: !!projectId
  });
};
