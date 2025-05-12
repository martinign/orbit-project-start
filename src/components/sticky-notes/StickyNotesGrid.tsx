
import React, { useRef } from "react";
import { StickyNote } from "@/hooks/useStickyNotes";
import { StickyNoteItem } from "./StickyNoteItem";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="h-[calc(100vh-240px)] min-h-[800px]">
      <div 
        ref={boardRef}
        className="relative w-full min-h-[calc(100vh-180px)] bg-[url('/cork-board.jpg')] bg-repeat rounded-lg p-8 border-2 border-gray-400/50 shadow-inner overflow-hidden"
        style={{ 
          minHeight: "800px",
          boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)"
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
    </ScrollArea>
  );
};
