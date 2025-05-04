
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectNotes from '@/components/ProjectNotes';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface NotesTabProps {
  projectId: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Notes</CardTitle>
        <CardDescription>View and manage project notes</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ProjectNotes projectId={projectId} searchQuery={searchQuery} />
      </CardContent>
    </Card>
  );
};
