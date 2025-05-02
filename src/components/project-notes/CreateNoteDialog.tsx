
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

type CreateNoteDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
};

const CreateNoteDialog = ({
  open,
  onClose,
  onSave,
  title,
  setTitle,
  content,
  setContent,
}: CreateNoteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
          <DialogDescription>
            Add a new note to this project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <Textarea
              id="content"
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
            onClick={onSave} 
            disabled={!title.trim()} 
            className="bg-blue-500 hover:bg-blue-600"
          >
            Create Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;
