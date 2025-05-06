
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectNotes from '@/components/ProjectNotes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNoteOperations } from '@/hooks/useNoteOperations';

interface NotesTabProps {
  projectId: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { setIsCreateDialogOpen } = useNoteOperations(projectId);
  
  const handleCreateNote = () => {
    setIsCreateDialogOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Project Notes</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-8 h-9 text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <CardDescription>View and manage project notes</CardDescription>
      </CardHeader>
      <CardContent>
        {user && (
          <div className="mb-4 flex justify-end">
            <Button 
              onClick={handleCreateNote} 
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Note
            </Button>
          </div>
        )}
        <ProjectNotes 
          projectId={projectId} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery} 
        />
      </CardContent>
    </Card>
  );
};
