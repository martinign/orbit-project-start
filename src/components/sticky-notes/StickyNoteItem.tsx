
import React, { useState } from "react";
import { StickyNote, useStickyNotes } from "@/hooks/useStickyNotes";
import { DraggableWrapper } from "./note-components/DraggableWrapper";
import { NoteCard } from "./note-components/NoteCard";

interface StickyNoteItemProps {
  note: StickyNote;
  onEditNote: (note: StickyNote) => void;
}

export const StickyNoteItem: React.FC<StickyNoteItemProps> = ({
  note,
  onEditNote
}) => {
  const { deleteNote } = useStickyNotes();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDelete = async () => {
    await deleteNote(note.id);
  };

  return (
    <DraggableWrapper 
      note={note} 
      isHovered={isHovered}
      setIsHovered={setIsHovered}
    >
      <NoteCard 
        note={note} 
        isHovered={isHovered} 
        isDragging={isDragging}
        onEditNote={onEditNote}
        onDeleteNote={handleDelete}
      />
    </DraggableWrapper>
  );
};
