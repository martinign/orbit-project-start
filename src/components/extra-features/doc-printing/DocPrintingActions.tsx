
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, FileText, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocRequest, DocStatus } from './api/docRequestsApi';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

  const canChangeStatus = request.doc_status !== 'completed' && request.doc_status !== 'cancelled';

  return (
    <div className="flex space-x-2">
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
    </div>
  );
};
