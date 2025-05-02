
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjectInvitesDialog } from "@/hooks/useProjectInvitesDialog";
import { ProjectSelector } from "./ProjectSelector";
import { RoleSelector } from "./RoleSelector";
import { UsersList } from "./UsersList";
import { DialogFooter } from "./DialogFooter";

interface ProjectInvitesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ProjectInvitesDialog = ({ open, onClose }: ProjectInvitesDialogProps) => {
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
          
          <RoleSelector
            value={memberRole}
            onChange={setMemberRole}
          />

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
