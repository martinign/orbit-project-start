
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define project invitation interface without recursive types
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

      // First, fetch the invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id,
          invitation_status,
          invitation_sender_id,
          invitation_recipient_id
        `)
        .eq("member_project_id", projectId);

      if (invitationsError) throw invitationsError;
      
      // Transform and return empty array if no invitations
      if (!invitationsData || invitationsData.length === 0) return [];
      
      // Use separate queries to fetch sender and recipient profiles
      const results = await Promise.all(
        invitationsData.map(async (invitation) => {
          // Fetch sender profile
          const { data: senderData } = await supabase
            .from("profiles")
            .select("full_name, last_name")
            .eq("id", invitation.invitation_sender_id)
            .single();
            
          // Fetch recipient profile  
          const { data: recipientData } = await supabase
            .from("profiles")
            .select("full_name, last_name")
            .eq("id", invitation.invitation_recipient_id)
            .single();
            
          return {
            id: invitation.member_invitation_id,
            inviter: {
              id: invitation.invitation_sender_id,
              full_name: senderData?.full_name || null,
              last_name: senderData?.last_name || null
            },
            invitee: {
              id: invitation.invitation_recipient_id,
              full_name: recipientData?.full_name || null,
              last_name: recipientData?.last_name || null
            },
            status: invitation.invitation_status
          };
        })
      );
      
      return results as ProjectInvitation[];
    },
    enabled: !!projectId,
  });
};
