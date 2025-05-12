
import React, { useRef } from "react";
import { StickyNote } from "@/hooks/useStickyNotes";
import { StickyNoteItem } from "./StickyNoteItem";

interface StickyNotesGridProps {
  notes: StickyNote[];
  onEditNote: (note: StickyNote) => void;
}

export const StickyNotesGrid: React.FC<StickyNotesGridProps> = ({
  notes,
  onEditNote
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={boardRef}
      className="relative w-full min-h-[calc(100vh-220px)] bg-[url('/cork-board.jpg')] bg-repeat rounded-lg p-6 border border-amber-800 shadow-inner overflow-hidden"
      style={{ 
        minHeight: "600px",
      }}
    >
      {notes.map((note) => (
        <StickyNoteItem 
          key={note.id}
          note={note}
          onEditNote={onEditNote}
        />
      ))}
    </div>
  );
};
