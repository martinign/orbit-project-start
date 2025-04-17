
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TeamMemberForm from "@/components/TeamMemberForm";

interface EditTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamMember: any;
  onSuccess: () => void;
}

const EditTeamMemberDialog: React.FC<EditTeamMemberDialogProps> = ({
  isOpen,
  onClose,
  teamMember,
  onSuccess,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>
        {teamMember && (
          <TeamMemberForm
            projectId={teamMember.project_id}
            teamMember={teamMember}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamMemberDialog;
