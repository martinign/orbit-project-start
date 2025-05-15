
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { FileIcon, Loader2, ExternalLink } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { DocRequestUpdate } from './hooks/useDocRequestUpdates';
import { supabase } from '@/integrations/supabase/client';
import { bytesToSize } from '@/utils/file-utils';

interface DocUpdatesDisplayProps {
  open: boolean;
  onClose: () => void;
  docRequestId: string;
  docTitle: string;
  updates: DocRequestUpdate[];
  isLoading: boolean;
  onMarkViewed: () => void;
}

export const DocUpdatesDisplay: React.FC<DocUpdatesDisplayProps> = ({
  open,
  onClose,
  docRequestId,
  docTitle,
  updates,
  isLoading,
  onMarkViewed
}) => {
  // Mark updates as viewed when opened
  useEffect(() => {
    if (open) {
      onMarkViewed();
    }
  }, [open, onMarkViewed]);

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>Document Updates</SheetTitle>
          <SheetDescription>
            Updates and comments for document: {docTitle}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : updates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No updates yet for this document.
            </p>
          ) : (
            updates.map((update) => (
              <UpdateItem key={update.id} update={update} />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface UpdateItemProps {
  update: DocRequestUpdate;
}

const UpdateItem: React.FC<UpdateItemProps> = ({ update }) => {
  const { data: userProfile, isLoading } = useUserProfile(update.user_id);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - h:mm a');
    } catch {
      return dateString;
    }
  };

  const getFullName = () => {
    if (isLoading) return 'Loading...';
    if (!userProfile) return 'Unknown User';
    return `${userProfile.full_name}${userProfile.last_name ? ' ' + userProfile.last_name : ''}`;
  };

  const downloadFile = async () => {
    if (!update.doc_file_path) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('doc-files')
        .download(update.doc_file_path);
      
      if (error) {
        console.error('Error downloading file:', error);
        return;
      }
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = update.doc_file_name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error processing download:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {getFullName()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(update.created_at)}
          </span>
        </div>
      </div>
      <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
        {update.content}
      </div>
      
      {update.doc_file_path && update.doc_file_name && (
        <div className="flex items-center gap-2 mt-2 bg-muted/30 p-2 rounded">
          <FileIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm truncate max-w-[200px]">
            {update.doc_file_name}
          </span>
          {update.doc_file_size && (
            <span className="text-xs text-muted-foreground">
              {bytesToSize(update.doc_file_size)}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0"
            onClick={downloadFile}
            title="Download file"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Separator className="mt-4" />
    </div>
  );
};
