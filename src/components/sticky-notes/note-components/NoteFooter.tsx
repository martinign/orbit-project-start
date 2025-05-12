
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { StickyNote } from "@/hooks/useStickyNotes";
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
import { CardFooter } from "@/components/ui/card";

interface NoteFooterProps {
  note: StickyNote;
  onEditNote: (note: StickyNote) => void;
  onDeleteNote: () => void;
}

export const NoteFooter: React.FC<NoteFooterProps> = ({ note, onEditNote, onDeleteNote }) => {
  return (
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
              <AlertDialogAction onClick={onDeleteNote} className="bg-red-600 text-white hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardFooter>
  );
};
