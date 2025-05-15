
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
import { FileIcon, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { bytesToSize } from '@/utils/file-utils';

interface DocUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  docRequestId: string;
  docTitle: string;
  onAddUpdate: (content: string, file?: File) => void;
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
  const [file, setFile] = useState<File | null>(null);

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

    onAddUpdate(content, file || undefined);
    setContent('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
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
            
            {file ? (
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{bytesToSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={removeFile}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600">
                    <Upload className="h-4 w-4" />
                    <span>Attach a file</span>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </label>
                <span className="text-xs text-gray-500 ml-2">(Max 10MB)</span>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                setContent('');
                setFile(null);
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
