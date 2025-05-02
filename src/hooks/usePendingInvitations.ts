
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Interface to match what Supabase returns
export interface MemberInvitationWithProject {
  member_invitation_id: string;
  invitation_status: string;
  invitation_created_at: string;
  member_role: string;
  projects: {
    id: string;
    project_number: string;
    Sponsor: string | null;
    protocol_number: string | null;
  } | null;
  profiles: {
    id: string;
    full_name: string | null;
    last_name: string | null;
  } | null;
}

export const usePendingInvitations = (open: boolean) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: invitations, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ["pending_member_invitations"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      const { data, error } = await supabase
        .from("member_invitations")
        .select(`
          member_invitation_id, 
          invitation_status, 
          invitation_created_at,
          member_role,
          projects:member_project_id (
            id, 
            project_number, 
            Sponsor, 
            protocol_number
          ),
          profiles:invitation_sender_id (
            id,
            full_name,
            last_name
          )
        `)
        .eq("invitation_recipient_id", user.user.id)
        .eq("invitation_status", "pending")
        .order("invitation_created_at", { ascending: false });
        
      if (error) throw error;
      // Type cast to handle potential type mismatches
      return data as unknown as MemberInvitationWithProject[];
    },
    enabled: open
  });

  const acceptInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");
      
      // 1. First update the invitation status
      const { data: invitation, error: getError } = await supabase
        .from("member_invitations")
        .select("member_project_id, member_role")
        .eq("member_invitation_id", invitationId)
        .single();
        
      if (getError) throw getError;
      
      // 2. Update the invitation status
      const { error: updateError } = await supabase
        .from("member_invitations")
        .update({ invitation_status: "accepted" })
        .eq("member_invitation_id", invitationId);
        
      if (updateError) throw updateError;
      
      // 3. Add the user to project team members
      if (invitation) {
        // Get user profile info
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, last_name")
          .eq("id", user.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const { error: insertError } = await supabase
          .from("project_team_members")
          .insert({
            project_id: invitation.member_project_id,
            user_id: user.user.id,
            full_name: profile?.full_name || user.user.email?.split('@')[0] || "Team Member",
            last_name: profile?.last_name || "",
            role: invitation.member_role,
          });
          
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invitation accepted successfully",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["pending_member_invitations_count"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    }
  });

  const rejectInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("member_invitations")
        .update({ invitation_status: "rejected" })
        .eq("member_invitation_id", invitationId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invitation rejected",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["pending_member_invitations_count"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject invitation",
        variant: "destructive",
      });
    }
  });

  return {
    invitations,
    isLoading,
    acceptInvitation,
    rejectInvitation
  };
};
