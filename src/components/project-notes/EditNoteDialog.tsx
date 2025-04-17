
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type EditNoteDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
};

const EditNoteDialog = ({
  open,
  onClose,
  onUpdate,
  title,
  setTitle,
  content,
  setContent,
}: EditNoteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Update the note details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>
          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onUpdate} 
            disabled={!title.trim()} 
            className="bg-blue-500 hover:bg-blue-600"
          >
            Update Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteDialog;
