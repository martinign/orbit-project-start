
import React, { useRef, useEffect, useCallback } from "react";
import { StickyNote } from "@/hooks/useStickyNotes";
import { StickyNoteItem } from "./StickyNoteItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useZoomPanControl } from "@/hooks/useZoomPanControl";

interface StickyNotesGridProps {
  notes: StickyNote[];
  onEditNote: (note: StickyNote) => void;
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  startPan: (e: React.MouseEvent) => void;
  pan: (e: React.MouseEvent) => void;
  endPan: () => void;
  handleWheel: (e: WheelEvent) => void;
}

export const StickyNotesGrid: React.FC<StickyNotesGridProps> = ({
  notes,
  onEditNote,
  scale,
  offsetX,
  offsetY,
  isDragging,
  startPan,
  pan,
  endPan,
  handleWheel
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boardElement = boardRef.current;
    if (boardElement) {
      boardElement.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (boardElement) {
        boardElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  return (
    <ScrollArea className="h-[calc(100vh-240px)] min-h-[800px]">
      {/* Full area container with border and shadow */}
      <div 
        ref={boardRef}
        className="relative w-full min-h-[calc(100vh-180px)] border border-stone-300 rounded-lg"
        style={{ 
          minHeight: "800px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.05)",
          transition: "box-shadow 0.3s ease",
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={startPan}
        onMouseMove={pan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
      >
        {/* Zoomable and pannable content */}
        <div
          ref={contentRef}
          className="absolute inset-0 bg-[url('/cork-board.jpg')] bg-repeat p-8 rounded-lg"
          style={{
            transform: `scale(${scale}) translate(${offsetX / scale}px, ${offsetY / scale}px)`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
          }}
        >
          {notes.map((note) => (
            <StickyNoteItem 
              key={note.id}
              note={note}
              onEditNote={onEditNote}
              scale={scale}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
