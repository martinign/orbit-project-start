import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNewItems } from '@/hooks/useNewItems';
import { cn } from '@/lib/utils';

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
  const { newItemsCount, markItemViewed } = useNewItems(note.project_id);
  const isNew = newItemsCount['note'] > 0;

  useEffect(() => {
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
        "transition-colors duration-300",
        isNew && "bg-blue-50 dark:bg-blue-900/10"
      )}
    >
      <CardContent className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{note.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{note.content || 'No content'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(note)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => onDelete(note)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteItem;
