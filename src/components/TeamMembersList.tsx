
import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TeamMembersTable from './team-members/TeamMembersTable';
import TeamMembersCardView from './team-members/TeamMembersCardView';
import EditTeamMemberDialog from './team-members/EditTeamMemberDialog';
import DeleteTeamMemberDialog from './team-members/DeleteTeamMemberDialog';
import TeamMembersEmptyState from './team-members/TeamMembersEmptyState';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface TeamMembersListProps {
  projectId: string | null;
  searchQuery: string;
  viewMode: "table" | "card";
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  projectId, 
  searchQuery, 
  viewMode 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team_members", projectId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("project_team_members")
        .select(`
          *,
          projects:project_id(
            id,
            project_number,
            Sponsor
          )
        `)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,job_title.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    },
  });

  // Use the improved realtime subscription hook
  useRealtimeSubscription({
    table: 'project_team_members',
    filter: projectId ? 'project_id' : undefined,
    filterValue: projectId || undefined,
    onRecordChange: () => {
      // Add debouncing to prevent UI freezes
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['team_members'] });
      }, 100);
    }
  });

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    
    try {
      const { error } = await supabase
        .from("project_team_members")
        .delete()
        .eq("id", selectedMember.id);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["team_members"] });

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team member",
        variant: "destructive",
      });
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    // Small delay to ensure state is updated correctly
    setTimeout(() => setSelectedMember(null), 100);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    // Small delay to ensure state is updated correctly
    setTimeout(() => setSelectedMember(null), 100);
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading team members...</div>;
  }

  if (!teamMembers || teamMembers.length === 0) {
    return <TeamMembersEmptyState projectId={projectId} />;
  }

  return (
    <div>
      {viewMode === "table" ? (
        <TeamMembersTable 
          teamMembers={teamMembers} 
          projectId={projectId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <TeamMembersCardView 
          teamMembers={teamMembers} 
          projectId={projectId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog components */}
      <EditTeamMemberDialog 
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        teamMember={selectedMember}
        onSuccess={() => {
          handleCloseEditDialog();
          queryClient.invalidateQueries({ queryKey: ["team_members"] });
        }}
      />
      
      <DeleteTeamMemberDialog 
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        teamMember={selectedMember}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default TeamMembersList;
