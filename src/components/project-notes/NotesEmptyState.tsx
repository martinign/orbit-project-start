
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
        {onCreateNote && (
          <Button 
            onClick={onCreateNote}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Note
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesEmptyState;
