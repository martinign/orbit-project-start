
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectInvitationsList from '@/components/project-invitations/ProjectInvitationsList';

interface InvitesTabProps {
  projectId: string;
}

export const InvitesTab: React.FC<InvitesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Invitations</CardTitle>
        <CardDescription>
          View and manage project invitations. You can assign permissions:
          <ul className="mt-2 ml-4 list-disc text-sm">
            <li>Owner - Full project control and ownership</li>
            <li>Admin - Can manage team members and most settings</li>
            <li>Can Edit - Can edit project content</li>
            <li>Read Only - Can only view project content</li>
          </ul>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectInvitationsList projectId={projectId} />
      </CardContent>
    </Card>
  );
};
