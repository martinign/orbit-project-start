
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StickyNote } from "@/hooks/useStickyNotes";
import { NoteContent } from "./NoteContent";
import { NoteFooter } from "./NoteFooter";

interface NoteCardProps {
  note: StickyNote;
  isHovered: boolean;
  isDragging: boolean;
  onEditNote: (note: StickyNote) => void;
  onDeleteNote: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  isHovered, 
  isDragging,
  onEditNote,
  onDeleteNote
}) => {
  return (
    <Card 
      className={`w-64 overflow-hidden shadow-lg flex flex-col ${isDragging ? 'shadow-xl' : ''}`}
      style={{ 
        backgroundColor: note.color,
        transform: 'none', // Remove rotation
        scale: isHovered ? '1.1' : '1', // Just scale up, no rotation
        boxShadow: isHovered 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          : isDragging 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transition: isDragging ? 'none' : 'all 0.3s ease',
      }}
    >
      <CardHeader className="p-4 pb-2 font-medium border-b">
        <h3 className="text-lg font-semibold truncate">{note.title}</h3>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <NoteContent content={note.content} isHovered={isHovered} />
      </CardContent>
      
      <NoteFooter 
        note={note} 
        onEditNote={onEditNote}
        onDeleteNote={onDeleteNote} 
      />
    </Card>
  );
};
