
import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { format } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Calendar, User, Info } from 'lucide-react';
import NoteItem from './NoteItem';

type ProjectNote = {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type NotesListProps = {
  notes: ProjectNote[];
  onEditNote: (note: ProjectNote) => void;
  onDeleteConfirmation: (note: ProjectNote) => void;
};

const NotesList = ({ notes, onEditNote, onDeleteConfirmation }: NotesListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <HoverCard key={note.id}>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              <NoteItem 
                note={note} 
                onEdit={onEditNote} 
                onDelete={onDeleteConfirmation} 
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 opacity-70" />
                <span className="text-sm text-muted-foreground">
                  Created: {format(new Date(note.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
              <NoteCreator userId={note.user_id} />
              <div className="pt-2">
                <h4 className="text-sm font-semibold">Content:</h4>
                <p className="text-sm text-muted-foreground">
                  {note.content || 'No content'}
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
};

const NoteCreator = ({ userId }: { userId: string }) => {
  const { data: userProfile } = useUserProfile(userId);
  
  return (
    <div className="flex items-center space-x-2">
      <User className="h-4 w-4 opacity-70" />
      <span className="text-sm text-muted-foreground">
        Created by: {userProfile?.displayName || 'Unknown User'}
      </span>
    </div>
  );
};

export default NotesList;

