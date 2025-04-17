
import React from 'react';
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
    <div className="grid gap-6">
      {notes.map((note) => (
        <NoteItem 
          key={note.id} 
          note={note} 
          onEdit={onEditNote} 
          onDelete={onDeleteConfirmation} 
        />
      ))}
    </div>
  );
};

export default NotesList;
