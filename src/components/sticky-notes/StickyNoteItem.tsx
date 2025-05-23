
import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { StickyNote, useStickyNotes } from "@/hooks/useStickyNotes";
import { format } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StickyNoteItemProps {
  note: StickyNote;
  onEditNote: (note: StickyNote) => void;
  scale: number; // Add scale prop
}

export const StickyNoteItem: React.FC<StickyNoteItemProps> = ({
  note,
  onEditNote,
  scale
}) => {
  const { deleteNote, updateNote } = useStickyNotes();
  const [position, setPosition] = useState({ x: note.x_position || 0, y: note.y_position || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const rotation = note.rotation || 0;
  
  // Update local position when note position changes from props
  useEffect(() => {
    setPosition({ 
      x: note.x_position || 0, 
      y: note.y_position || 0 
    });
  }, [note.x_position, note.y_position]);

  // Set initial random rotation if not already set
  useEffect(() => {
    if (note.rotation === 0 && noteRef.current) {
      const randomRotation = Math.floor((Math.random() * 6) - 3); // Integer between -3 and 3
      updateNote(note.id, {
        rotation: randomRotation
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || 
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return; // Don't start drag if clicking on a button or dialog
    }
    
    // Stop event propagation to prevent board panning
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    
    // Account for scale in calculating start position
    setStartPos({ 
      x: e.clientX / scale - position.x, 
      y: e.clientY / scale - position.y 
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target instanceof HTMLButtonElement || 
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return; // Don't start drag if touching a button or dialog
    }
    
    // Stop event propagation to prevent board panning
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    
    // Account for scale in calculating start position
    setStartPos({ 
      x: touch.clientX / scale - position.x, 
      y: touch.clientY / scale - position.y 
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Account for scale when calculating new position
    const newX = e.clientX / scale - startPos.x;
    const newY = e.clientY / scale - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    // Account for scale when calculating new position
    const newX = touch.clientX / scale - startPos.x;
    const newY = touch.clientY / scale - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Save the new position in the database
    try {
      console.log(`Saving position for note ${note.id}: x=${position.x}, y=${position.y}`);
      await updateNote(note.id, {
        x_position: position.x,
        y_position: position.y
      });
    } catch (error) {
      console.error('Error updating sticky note position:', error);
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
  }, [isDragging, startPos, position, scale]); // Added scale as a dependency
  
  const handleDelete = async () => {
    await deleteNote(note.id);
  };
  
  return (
    <div 
      ref={noteRef}
      className={`absolute ${isDragging ? 'z-50' : (isHovered ? 'z-20' : 'z-10')}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease, transform 0.3s ease, scale 0.3s ease',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`w-64 overflow-hidden shadow-lg flex flex-col ${isDragging ? 'shadow-xl' : ''}`}
        style={{ 
          backgroundColor: note.color,
          transform: isHovered ? 'translateY(-8px)' : 'none',
          scale: isHovered ? '1.05' : '1',
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
          <div className="whitespace-pre-wrap text-gray-700 text-sm">
            {note.content}
          </div>
        </CardContent>
        
        <CardFooter className="p-3 border-t flex justify-between items-center bg-white bg-opacity-40">
          <span className="text-xs text-gray-500">
            {format(new Date(note.created_at), 'MMM d, yyyy')}
          </span>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEditNote(note)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Note</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this note? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
