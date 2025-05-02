
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjectInvitesDialog, MemberRole } from "@/hooks/useProjectInvitesDialog";
import { ProjectSelector } from "./ProjectSelector";
import { RoleSelector } from "./RoleSelector";
import { UsersList } from "./UsersList";
import { DialogFooter } from "./DialogFooter";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectInvitesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ProjectInvitesDialog = ({ open, onClose }: ProjectInvitesDialogProps) => {
  const { user } = useAuth();
  
  const { data: ownedProjects, isLoading: checkingProjects } = useQuery({
    queryKey: ["owned_projects"],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open,
  });
  
  const isProjectOwner = ownedProjects && ownedProjects.length > 0;

  const {
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
  } = useProjectInvitesDialog(open);

  const handleSubmit = async () => {
    const success = await handleInvite();
    if (success) {
      onClose();
    }
  };

  // Show access denied message if user isn't a project owner
  if (!checkingProjects && !isProjectOwner) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Project Invites</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only project owners can send project invitations.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Select Project</h3>
            <ProjectSelector
              projects={projects}
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
              isLoading={projectsLoading}
            />
          </div>
          
          <div>
            <h3 className="mb-2 text-sm font-medium">Select Role</h3>
            <RoleSelector
              value={memberRole}
              onChange={(value: MemberRole) => setMemberRole(value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Owner:</strong> Full control over the project, including deletion.
              <br />
              <strong>Admin:</strong> Can manage tasks and team members, but cannot delete the project.
            </p>
          </div>

          <UsersList
            profiles={filteredProfiles}
            isLoading={profilesLoading}
            selectedUsers={selectedUsers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onUserSelect={handleUserSelect}
          />
          
          <DialogFooter
            onCancel={onClose}
            onSubmit={handleSubmit}
            isLoading={loading}
            isDisabled={selectedUsers.length === 0 || !selectedProject}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectInvitesDialog;
