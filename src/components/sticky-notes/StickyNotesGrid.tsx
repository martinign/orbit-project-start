
import React, { useRef, useEffect } from "react";
import { StickyNote } from "@/hooks/useStickyNotes";
import { StickyNoteItem } from "./StickyNoteItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useZoomPanControl, ZoomPanState } from "@/hooks/sticky-notes/useZoomPanControl";
import { ZoomControls } from "./ZoomControls";

interface StickyNotesGridProps {
  notes: StickyNote[];
  onEditNote: (note: StickyNote) => void;
}

export const StickyNotesGrid: React.FC<StickyNotesGridProps> = ({
  notes,
  onEditNote
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const boardContentRef = useRef<HTMLDivElement>(null);
  
  const {
    zoomPan,
    isPanning,
    zoomIn,
    zoomOut,
    resetZoomPan,
    startPan,
    updatePan,
    endPan,
    handleWheel
  } = useZoomPanControl({ boardRef });
  
  // Add wheel event listener for zooming
  useEffect(() => {
    const boardElement = boardRef.current;
    if (!boardElement) return;
    
    boardElement.addEventListener('wheel', handleWheel);
    return () => {
      boardElement.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);
  
  // Handle mouse events for panning
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start panning if it's not a click on a note or button
    if (
      e.target instanceof HTMLDivElement && 
      e.target === boardContentRef.current &&
      e.button === 0 // Left mouse button
    ) {
      startPan(e.clientX, e.clientY);
    }
  };
  
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      e.preventDefault();
      updatePan(e.clientX, e.clientY);
    }
  };
  
  const onMouseUp = () => {
    if (isPanning) {
      endPan();
    }
  };
  
  // Handle touch events for panning on mobile
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only start panning if it's a touch on the background (not a note)
    if (
      e.target instanceof HTMLDivElement && 
      e.target === boardContentRef.current
    ) {
      const touch = e.touches[0];
      startPan(touch.clientX, touch.clientY);
    }
  };
  
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPanning) {
      const touch = e.touches[0];
      updatePan(touch.clientX, touch.clientY);
    }
  };
  
  const onTouchEnd = () => {
    if (isPanning) {
      endPan();
    }
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <ZoomControls 
          zoomPan={zoomPan}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoomPan}
        />
      </div>
      
      <ScrollArea className="h-[calc(100vh-240px)] min-h-[800px]">
        <div 
          ref={boardRef}
          className="relative w-full min-h-[calc(100vh-180px)] overflow-hidden"
          style={{ 
            minHeight: "800px",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Board container with border that stays fixed */}
          <div className="absolute top-0 left-0 w-[3000px] h-[2000px] rounded-lg border-2 border-gray-400/50 shadow-inner overflow-hidden">
            {/* Board content that scales with zoom */}
            <div
              ref={boardContentRef}
              className="absolute top-0 left-0 w-full h-full bg-[url('/cork-board.jpg')] bg-repeat p-8"
              style={{
                transform: `scale(${zoomPan.scale}) translate(${zoomPan.translateX / zoomPan.scale}px, ${zoomPan.translateY / zoomPan.scale}px)`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                cursor: isPanning ? 'grabbing' : 'grab',
                boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)"
              }}
            >
              {notes.map((note) => (
                <StickyNoteItem 
                  key={note.id}
                  note={note}
                  onEditNote={onEditNote}
                  currentScale={zoomPan.scale}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};
