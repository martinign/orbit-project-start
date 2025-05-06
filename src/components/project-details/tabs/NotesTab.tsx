
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectNotes from '@/components/ProjectNotes';
import { useAuth } from '@/contexts/AuthContext';
import { useNoteOperations } from '@/hooks/useNoteOperations';

interface NotesTabProps {
  projectId: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const { setIsCreateDialogOpen } = useNoteOperations(projectId);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Project Notes</CardTitle>
        </div>
        <CardDescription>View and manage project notes</CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectNotes 
          projectId={projectId}
        />
      </CardContent>
    </Card>
  );
};
