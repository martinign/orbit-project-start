
import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

type NotesEmptyStateProps = {
  onCreateNote: (() => void) | null;
};

const NotesEmptyState = ({ onCreateNote }: NotesEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground mb-4">No notes found for this project</p>
      </CardContent>
    </Card>
  );
};

export default NotesEmptyState;
