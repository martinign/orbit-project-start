
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Trash2 } from "lucide-react";
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
}

export const StickyNoteItem: React.FC<StickyNoteItemProps> = ({
  note,
  onEditNote
}) => {
  const { deleteNote } = useStickyNotes();
  
  const handleDelete = async () => {
    await deleteNote(note.id);
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col relative" style={{ backgroundColor: note.color }}>
      {/* Pin icon */}
      <div className="absolute -right-1 -top-1 transform rotate-12 text-gray-700">
        <MapPin className="w-6 h-6 drop-shadow-md" strokeWidth={2.5} />
      </div>

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
  );
};
