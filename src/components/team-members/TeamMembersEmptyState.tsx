
import React from "react";
import { UserCog } from "lucide-react";

interface TeamMembersEmptyStateProps {
  projectId: string | null;
}

const TeamMembersEmptyState: React.FC<TeamMembersEmptyStateProps> = ({ projectId }) => {
  return (
    <div className="text-center p-8 text-muted-foreground bg-gray-50 rounded-md">
      <UserCog className="mx-auto h-12 w-12 opacity-20 mb-2" />
      <h3 className="text-lg font-medium">No team members found</h3>
      <p className="mb-4">
        {projectId 
          ? "This project doesn't have any team members yet." 
          : "No team members added to any projects yet."}
      </p>
    </div>
  );
};

export default TeamMembersEmptyState;
