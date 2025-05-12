
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNewItems } from '@/hooks/useNewItems';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import NoteAttachment from './NoteAttachment';

type ProjectNote = {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_private: boolean;
  file_path?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
};

type NoteItemProps = {
  note: ProjectNote;
  onEdit: (note: ProjectNote) => void;
  onDelete: (note: ProjectNote) => void;
  hasEditAccess: boolean;
};

const NoteItem = ({ note, onEdit, onDelete, hasEditAccess }: NoteItemProps) => {
  const { newItemsCount, markItemViewed } = useNewItems(note.project_id);
  const isNew = newItemsCount['note'] > 0;
  const { user } = useAuth();
  
  // Check if the current user is the creator of this note
  const isNoteOwner = user?.id === note.user_id;

  // Check if the note has a file attachment
  const hasAttachment = note.file_path && note.file_name && note.file_type;

  React.useEffect(() => {
    const handleViewItem = async () => {
      if (isNew) {
        await markItemViewed(note.id, 'note');
      }
    };

    handleViewItem();
  }, [isNew, note.id, markItemViewed]);

  return (
    <Card 
      className={cn(
        "h-full transition-all duration-200 hover:shadow-md",
        isNew && "bg-blue-50 dark:bg-blue-900/10"
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-lg mb-2 line-clamp-2">{note.title}</h4>
          {isNoteOwner && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{note.content || 'No content'}</p>
        
        {/* Display file attachment if present */}
        {hasAttachment && (
          <NoteAttachment 
            fileName={note.file_name!}
            filePath={note.file_path!}
            fileType={note.file_type!}
            fileSize={note.file_size || null}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default NoteItem;
