
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/hooks/useUserProfile';
import { DocRequestUpdate } from './hooks/useDocRequestUpdates';

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
      <Separator className="mt-4" />
    </div>
  );
};
