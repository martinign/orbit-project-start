
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import MemberInvitationsList from '@/components/project-invitations/MemberInvitationsList';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InvitesTabProps {
  projectId: string;
}

export const InvitesTab: React.FC<InvitesTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  
  // Check if current user is the project owner
  const { data: project, isLoading } = useQuery({
    queryKey: ['project_owner_check_invites', projectId],
    queryFn: async () => {
      if (!projectId || !user) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId && !!user
  });
  
  const isProjectOwner = user?.id === project?.user_id;

  // If not project owner, show access denied message
  if (!isLoading && !isProjectOwner) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Only the project owner can view and manage invitations.
        </AlertDescription>
      </Alert>
    );
  }

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
