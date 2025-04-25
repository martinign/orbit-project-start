
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectNotes from '@/components/ProjectNotes';

interface NotesTabProps {
  projectId: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Notes</CardTitle>
        <CardDescription>View and manage project notes</CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectNotes projectId={projectId} />
      </CardContent>
    </Card>
  );
};
