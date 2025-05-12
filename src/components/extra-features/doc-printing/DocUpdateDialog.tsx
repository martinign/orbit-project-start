
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  docRequestId: string;
  docTitle: string;
  onAddUpdate: (content: string) => void;
  isSubmitting: boolean;
}

export const DocUpdateDialog: React.FC<DocUpdateDialogProps> = ({
  open,
  onClose,
  docRequestId,
  docTitle,
  onAddUpdate,
  isSubmitting
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Update content cannot be empty");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to add updates");
      return;
    }

    onAddUpdate(content);
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Document Update</DialogTitle>
            <DialogDescription>
              Add a new update or comment for document: {docTitle}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter update details or comments..."
              rows={5}
              className="w-full"
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                setContent('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Update'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
