
import React from 'react';
import { DocRequest, DocStatus } from '../api/docRequestsApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DocRequestStatusBadge } from '../DocRequestStatusBadge';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AuthWarning } from './AuthWarning';
import { FileAttachmentCell } from './FileAttachmentCell';
import { MessageSquare } from 'lucide-react';
import { useDocRequestUpdates } from '../hooks/useDocRequestUpdates';
import { DocPrintingActions } from '../DocPrintingActions';

interface DocPrintingContentProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  filteredRequests: DocRequest[];
  onEdit: (request: DocRequest) => void;
  onDelete: (request: DocRequest) => void;
  onStatusChange: (requestId: string, status: DocStatus) => void;
  onAddUpdate?: (request: DocRequest) => void;
  onViewUpdates?: (request: DocRequest) => void;
}

// Make a separate component for each row to handle individual update counts
const RequestRow = ({ request, onEdit, onDelete, onStatusChange, onAddUpdate, onViewUpdates }: {
  request: DocRequest;
  onEdit: (request: DocRequest) => void;
  onDelete: (request: DocRequest) => void;
  onStatusChange: (requestId: string, status: DocStatus) => void;
  onAddUpdate?: (request: DocRequest) => void;
  onViewUpdates?: (request: DocRequest) => void;
}) => {
  // Use the hook for each row to track updates
  const { updates, updateCount } = useDocRequestUpdates(request.id);
  
  // Only show the icon if there are actually updates
  const hasUpdates = updates && updates.length > 0;

  return (
    <TableRow className={hasUpdates ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <span>{request.doc_title}</span>
          {request.doc_type === 'SLB' && request.doc_version && (
            <span className="ml-1 text-xs text-gray-500">
              (v{request.doc_version})
            </span>
          )}
          {hasUpdates && (
            <div className="relative">
              <MessageSquare className="h-4 w-4 text-blue-500 ml-1" />
              {updateCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full w-4 h-4">
                  {updateCount}
                </span>
              )}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={request.doc_type === 'SLB' ? 'default' : 'secondary'}>
          {request.doc_type}
        </Badge>
      </TableCell>
      <TableCell>
        {request.doc_request_type === 'printing' ? 'Printing' : 'Proposal'}
      </TableCell>
      <TableCell>{request.doc_amount}</TableCell>
      <TableCell className="truncate max-w-xs">
        {request.doc_delivery_address || '—'}
      </TableCell>
      <TableCell>
        {request.doc_selected_vendor || '—'}
      </TableCell>
      <TableCell>
        <FileAttachmentCell request={request} />
      </TableCell>
      <TableCell>
        <DocRequestStatusBadge status={request.doc_status} />
      </TableCell>
      <TableCell>
        {request.doc_due_date ? format(new Date(request.doc_due_date), 'MMM d, yyyy') : '—'}
      </TableCell>
      <TableCell>
        {format(new Date(request.created_at), 'MMM d, yyyy')}
      </TableCell>
      <TableCell className="text-right">
        <DocPrintingActions
          request={request}
          onEdit={() => onEdit(request)}
          onDelete={() => onDelete(request)}
          onStatusChange={(status) => onStatusChange(request.id, status)}
          onViewUpdates={onViewUpdates ? () => onViewUpdates(request) : undefined}
          onAddUpdate={onAddUpdate ? () => onAddUpdate(request) : undefined}
        />
      </TableCell>
    </TableRow>
  );
};

export const DocPrintingContent: React.FC<DocPrintingContentProps> = ({
  isAuthenticated,
  isLoading,
  filteredRequests,
  onEdit,
  onDelete,
  onStatusChange,
  onAddUpdate,
  onViewUpdates
}) => {
  if (!isAuthenticated) {
    return <AuthWarning />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No document requests found.</p>
      </div>
    );
  }

  // Define consistent column widths
  const columnWidths = {
    title: "14%",
    type: "8%",
    requestType: "10%",
    amount: "6%",
    deliveryAddress: "12%",
    vendor: "8%",
    attachment: "10%",
    status: "8%",
    dueDate: "10%",
    created: "8%",
    actions: "10%"
  };

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: columnWidths.title }}>Title</TableHead>
            <TableHead style={{ width: columnWidths.type }}>Type</TableHead>
            <TableHead style={{ width: columnWidths.requestType }}>Request Type</TableHead>
            <TableHead style={{ width: columnWidths.amount }}>Amount</TableHead>
            <TableHead style={{ width: columnWidths.deliveryAddress }}>Delivery Address</TableHead>
            <TableHead style={{ width: columnWidths.vendor }}>Vendor</TableHead>
            <TableHead style={{ width: columnWidths.attachment }}>Attachment</TableHead>
            <TableHead style={{ width: columnWidths.status }}>Status</TableHead>
            <TableHead style={{ width: columnWidths.dueDate }}>Due Date</TableHead>
            <TableHead style={{ width: columnWidths.created }}>Created</TableHead>
            <TableHead style={{ width: columnWidths.actions }} className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((request) => (
            <RequestRow 
              key={request.id}
              request={request}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onAddUpdate={onAddUpdate}
              onViewUpdates={onViewUpdates}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
