
import React, { useState, useEffect, useRef } from "react";
import { StickyNote, useStickyNotes } from "@/hooks/useStickyNotes";

interface DraggableWrapperProps {
  note: StickyNote;
  children: React.ReactNode;
  isHovered: boolean;
  setIsHovered: (isHovered: boolean) => void;
}

export const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  note,
  children,
  isHovered,
  setIsHovered
}) => {
  const { updateNote } = useStickyNotes();
  const [position, setPosition] = useState({ x: note.x_position || 0, y: note.y_position || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const rotation = note.rotation || 0;

  // Set initial random rotation if not already set
  useEffect(() => {
    if (note.rotation === 0 && noteRef.current) {
      const randomRotation = Math.floor((Math.random() * 6) - 3); // Integer between -3 and 3
      updateNote(note.id, {
        rotation: randomRotation
      });
    }
  }, []);

  // Synchronize position state with note position from database
  // But only when not actively dragging
  useEffect(() => {
    if (!isDragging && (note.x_position !== undefined || note.y_position !== undefined)) {
      setPosition({
        x: note.x_position || 0,
        y: note.y_position || 0
      });
    }
  }, [note.x_position, note.y_position, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || 
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return; // Don't start drag if clicking on a button or dialog
    }
    
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target instanceof HTMLButtonElement || 
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return; // Don't start drag if touching a button or dialog
    }
    
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - startPos.x;
    const newY = touch.clientY - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // This is the important part - save the final position to the database
    // We need to await this to make sure the database is updated
    try {
      await updateNote(note.id, {
        x_position: position.x,
        y_position: position.y
      });
      console.log("Position saved:", position.x, position.y);
    } catch (error) {
      console.error("Error saving position:", error);
    }
  };

  // Add event listeners for mouse and touch events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, startPos, position]); // Position is a dependency so it's updated during drag

  return (
    <div 
      ref={noteRef}
      className={`absolute ${isDragging ? 'z-50' : (isHovered ? 'z-20' : 'z-10')}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'box-shadow 0.3s ease, transform 0.3s ease, scale 0.3s ease',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};
