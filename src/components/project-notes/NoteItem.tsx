
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ProjectNote = {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type NoteItemProps = {
  note: ProjectNote;
  onEdit: (note: ProjectNote) => void;
  onDelete: (note: ProjectNote) => void;
};

const NoteItem = ({ note, onEdit, onDelete }: NoteItemProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{note.title}</CardTitle>
            <CardDescription>
              {formatDate(note.created_at)}
              {note.created_at !== note.updated_at && 
                ` • Updated ${formatDate(note.updated_at)}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(note)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(note)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {note.content ? (
            <div className="whitespace-pre-wrap">{note.content}</div>
          ) : (
            <p className="text-muted-foreground italic">No content</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteItem;
