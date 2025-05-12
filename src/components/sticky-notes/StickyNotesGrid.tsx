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
  endPan
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Attach wheel event for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }, []);
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('wheel', handleWheel, {
        passive: false
      });
    }
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);
  return <ScrollArea className="h-[calc(100vh-240px)] min-h-[800px]">
      {/* Fixed border container that doesn't zoom */}
      <div ref={boardRef} className="relative w-full min-h-[calc(100vh-180px)] rounded-lg border-2 border-gray-400/50 overflow-hidden" style={{
      minHeight: "800px",
      boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 20px rgba(0, 0, 0, 0.1)",
      background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)"
    }}>
        {/* Inner border with shade effect */}
        <div className="absolute inset-0 rounded-lg border border-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"></div>
        
        {/* Zoomable and pannable content */}
        
      </div>
    </ScrollArea>;
};