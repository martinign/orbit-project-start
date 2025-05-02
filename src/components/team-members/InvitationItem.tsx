
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { MemberInvitationWithProject } from "@/hooks/usePendingInvitations";

interface InvitationItemProps {
  invitation: MemberInvitationWithProject;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export const InvitationItem = ({ 
  invitation, 
  onAccept, 
  onReject, 
  isAccepting, 
  isRejecting 
}: InvitationItemProps) => {
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Administrator';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  
  const formatName = (profile: { full_name: string | null; last_name: string | null; } | null) => {
    if (!profile) return "Unknown";
    return [profile.full_name, profile.last_name].filter(Boolean).join(" ") || "Unknown";
  };

  const getProjectDisplay = () => {
    if (!invitation.projects) return "Unknown Project";
    
    // Check the project_type to determine the display format
    if (invitation.projects.project_type === "billable") {
      return `${invitation.projects.project_number} - ${invitation.projects.Sponsor || ""}`;
    } else {
      // For non-billable projects, show project_number as "Project Title"
      return `Project Title: ${invitation.projects.project_number}`;
    }
  };

  return (
    <div
      key={invitation.member_invitation_id}
      className="border rounded-lg p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">
            {getProjectDisplay()}
          </h3>
          <p className="text-sm text-muted-foreground">
            From: {formatName(invitation.profiles)}
          </p>
          <p className="text-sm text-muted-foreground">
            Role: {getRoleDisplay(invitation.member_role)}
          </p>
          <p className="text-sm text-muted-foreground">
            Date: {format(new Date(invitation.invitation_created_at), "PP")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => onAccept(invitation.member_invitation_id)}
            disabled={isAccepting || isRejecting}
            className="w-28"
          >
            {isAccepting && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            Accept
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onReject(invitation.member_invitation_id)}
            disabled={isAccepting || isRejecting}
            className="w-28"
          >
            {isRejecting && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};
