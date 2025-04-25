
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
        <CardDescription>View and manage project invitations</CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectInvitationsList projectId={projectId} />
      </CardContent>
    </Card>
  );
};
