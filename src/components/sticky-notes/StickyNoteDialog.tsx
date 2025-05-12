
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, useStickyNotes } from "@/hooks/useStickyNotes";

interface ColorOption {
  name: string;
  value: string;
}

const colorOptions: ColorOption[] = [
  { name: "Yellow", value: "#FFF9C4" },
  { name: "Green", value: "#F2FCE2" },
  { name: "Blue", value: "#E3F2FD" },
  { name: "Pink", value: "#FCE4EC" },
  { name: "Purple", value: "#F3E5F5" },
  { name: "Orange", value: "#FFF3E0" },
];

interface StickyNoteDialogProps {
  open: boolean;
  onClose: () => void;
  note?: StickyNote | null;
}

export const StickyNoteDialog: React.FC<StickyNoteDialogProps> = ({
  open,
  onClose,
  note = null,
}) => {
  const { createNote, updateNote } = useStickyNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#F2FCE2");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens or note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setColor(note.color);
    } else {
      setTitle("");
      setContent("");
      setColor("#F2FCE2");
    }
  }, [note, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (note) {
        // Update existing note
        await updateNote(note.id, {
          title,
          content,
          color,
        });
      } else {
        // Create new note
        await createNote({
          title,
          content,
          color,
        });
      }
      
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === option.value ? "border-black" : "border-transparent"
                    }`}
                    style={{ backgroundColor: option.value }}
                    title={option.name}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSubmitting ? "Saving..." : note ? "Save Changes" : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
