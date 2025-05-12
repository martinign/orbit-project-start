import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, FileText, Edit, Trash2, MoreVertical, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocRequest, DocStatus } from './api/docRequestsApi';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDocRequestUpdates } from './hooks/useDocRequestUpdates';
import { DocUpdateDialog } from './DocUpdateDialog';
import { DocUpdatesDisplay } from './DocUpdatesDisplay';

interface DocPrintingActionsProps {
  request: DocRequest;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: DocStatus) => void;
}

export const DocPrintingActions: React.FC<DocPrintingActionsProps> = ({ 
  request, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  const { toast } = useToast();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdatesDisplayOpen, setIsUpdatesDisplayOpen] = useState(false);

  const {
    updates,
    updateCount,
    isLoading,
    addUpdate,
    isSubmitting,
    markUpdatesAsViewed
  } = useDocRequestUpdates(request.id);
  
  // Only show badge if there are actual updates
  const hasUpdates = updates && updates.length > 0;

  const handlePrint = () => {
    toast({
      title: "Document sent to printer",
      description: "Your document has been sent to the default printer",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Document ready for download",
      description: "Your document will download shortly",
    });
  };

  const handlePreview = () => {
    toast({
      title: "Document preview",
      description: "Preview functionality coming soon",
    });
  };

  const handleOpenUpdateDialog = () => {
    setIsUpdateDialogOpen(true);
  };

  const handleOpenUpdatesDisplay = () => {
    setIsUpdatesDisplayOpen(true);
  };

  const handleAddUpdate = (content: string) => {
    addUpdate(content, {
      onSuccess: () => setIsUpdateDialogOpen(false)
    });
  };

  const canChangeStatus = request.doc_status !== 'completed' && request.doc_status !== 'cancelled';

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleOpenUpdatesDisplay}
        className="relative"
      >
        <MessageSquare className="h-4 w-4" />
        {hasUpdates && (
          <Badge 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
            variant="destructive"
          >
            {updateCount > 9 ? '9+' : updateCount}
          </Badge>
        )}
      </Button>
      
      <Button variant="ghost" size="icon" onClick={onEdit} title="Edit">
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
      
      {canChangeStatus && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpenUpdateDialog}>
              Add Update/Comment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenUpdatesDisplay}>
              View All Updates
            </DropdownMenuItem>
            <DropdownMenuItem className="border-t mt-1 pt-1" />
            {request.doc_status === 'pending' && (
              <DropdownMenuItem onClick={() => onStatusChange('approved')}>
                Mark as Approved
              </DropdownMenuItem>
            )}
            {(request.doc_status === 'pending' || request.doc_status === 'approved') && (
              <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                Mark as Completed
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
              Cancel Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Document Update Dialog */}
      <DocUpdateDialog
        open={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        docRequestId={request.id}
        docTitle={request.doc_title}
        onAddUpdate={handleAddUpdate}
        isSubmitting={isSubmitting}
      />
      
      {/* Document Updates Display */}
      <DocUpdatesDisplay
        open={isUpdatesDisplayOpen}
        onClose={() => setIsUpdatesDisplayOpen(false)}
        docRequestId={request.id}
        docTitle={request.doc_title}
        updates={updates}
        isLoading={isLoading}
        onMarkViewed={markUpdatesAsViewed}
      />
    </div>
  );
};
