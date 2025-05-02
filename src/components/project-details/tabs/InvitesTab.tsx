
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import MemberInvitationsList from '@/components/project-invitations/MemberInvitationsList';

interface InvitesTabProps {
  projectId: string;
}

export const InvitesTab: React.FC<InvitesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Invitations</CardTitle>
        <CardDescription>
          View and manage project invitations. You can assign roles:
          <ul className="mt-2 ml-4 list-disc text-sm">
            <li>Owner - Full project control and ownership</li>
            <li>Admin - Can manage team members and most settings</li>
          </ul>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MemberInvitationsList projectId={projectId} />
      </CardContent>
    </Card>
  );
};
