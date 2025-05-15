
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DocRequest, DocStatus } from './api/docRequestsApi';
import { DocRequestStatusBadge } from './DocRequestStatusBadge';
import { MessageSquare, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DocPrintingActionsProps {
  request: DocRequest;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: DocStatus) => void;
  onViewUpdates?: (request: DocRequest) => void;
  onAddUpdate?: (request: DocRequest) => void;
}

export const DocPrintingActions: React.FC<DocPrintingActionsProps> = ({
  request,
  onEdit,
  onDelete,
  onStatusChange,
  onViewUpdates,
  onAddUpdate
}) => {
  const { user } = useAuth();
  // Check if current user is the creator of this document
  const isCreator = user?.id === request.user_id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isCreator && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onStatusChange('pending')}
          >
            Set to Pending
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onStatusChange('approved')}
          >
            Set to Approved
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onStatusChange('completed')}
          >
            Set to Completed
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onStatusChange('cancelled')}
          >
            Set to Cancelled
          </Button>
        </DropdownMenuItem>
        
        {onViewUpdates && (
          <DropdownMenuItem onClick={() => onViewUpdates(request)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>View Updates</span>
          </DropdownMenuItem>
        )}
        
        {onAddUpdate && (
          <DropdownMenuItem onClick={() => onAddUpdate(request)}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            <span>Add Update</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
