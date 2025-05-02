
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Profile {
  id: string;
  full_name: string | null;
  last_name: string | null;
}

export interface Project {
  id: string;
  project_number: string;
  Sponsor?: string;
}

export type MemberRole = "owner" | "admin";

export function useProjectInvitesDialog(open: boolean) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [memberRole, setMemberRole] = useState<MemberRole>("admin");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedProject("");
      setSearchQuery("");
      setSelectedUsers([]);
      setMemberRole("admin");
    }
  }, [open]);

  // Fetch all projects for the current user
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["user_projects"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor")
        .eq("user_id", user.user.id)
        .order("project_number");

      if (error) throw error;
      return data as Project[];
    },
    enabled: open,
  });

  // Fetch all profiles except current user
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["invite_profiles"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, last_name")
        .neq("id", user.user.id)
        .order("full_name");

      if (error) throw error;
      return data as Profile[];
    },
    enabled: open,
  });

  // Filter profiles based on search query
  const filteredProfiles = profiles?.filter(profile => {
    const searchTerm = searchQuery.toLowerCase();
    const fullName = `${profile.full_name || ''} ${profile.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm);
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleInvite = async () => {
    if (!selectedProject) {
      toast({
        title: "Project Required",
        description: "Please select a project to invite users to.",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to invite.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Create project invitations for each selected user using the new member_invitations table
      const invitations = selectedUsers.map(userId => ({
        member_project_id: selectedProject,
        invitation_sender_id: user.user.id,
        invitation_recipient_id: userId,
        invitation_status: "pending",
        member_role: memberRole,
      }));

      const { error } = await supabase
        .from("member_invitations")
        .insert(invitations);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitations sent to ${selectedUsers.length} user(s).`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["pending_member_invitations_count"] });
      
      return true;
    } catch (error: any) {
      console.error("Error sending invitations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedProject,
    setSelectedProject,
    searchQuery,
    setSearchQuery,
    selectedUsers,
    memberRole,
    setMemberRole,
    loading,
    projects,
    projectsLoading,
    filteredProfiles,
    profilesLoading,
    handleUserSelect,
    handleInvite,
  };
}
