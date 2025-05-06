
import React from 'react';
import { DocRequest, DocStatus } from '../api/docRequestsApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DocRequestStatusBadge } from '../DocRequestStatusBadge';
import { DocPrintingActions } from '../DocPrintingActions';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AuthWarning } from './AuthWarning';
import { FileAttachmentCell } from './FileAttachmentCell';

interface DocPrintingContentProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  filteredRequests: DocRequest[];
  onEdit: (request: DocRequest) => void;
  onDelete: (request: DocRequest) => void;
  onStatusChange: (requestId: string, status: DocStatus) => void;
}

export const DocPrintingContent: React.FC<DocPrintingContentProps> = ({
  isAuthenticated,
  isLoading,
  filteredRequests,
  onEdit,
  onDelete,
  onStatusChange
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
            <TableRow key={request.id}>
              <TableCell style={{ width: columnWidths.title }} className="font-medium">
                {request.doc_title}
                {request.doc_type === 'SLB' && request.doc_version && (
                  <span className="ml-1 text-xs text-gray-500">
                    (v{request.doc_version})
                  </span>
                )}
              </TableCell>
              <TableCell style={{ width: columnWidths.type }}>
                <Badge variant={request.doc_type === 'SLB' ? 'default' : 'secondary'}>
                  {request.doc_type}
                </Badge>
              </TableCell>
              <TableCell style={{ width: columnWidths.requestType }}>
                {request.doc_request_type === 'printing' ? 'Printing' : 'Proposal'}
              </TableCell>
              <TableCell style={{ width: columnWidths.amount }}>{request.doc_amount}</TableCell>
              <TableCell style={{ width: columnWidths.deliveryAddress }} className="truncate max-w-xs">
                {request.doc_delivery_address || '—'}
              </TableCell>
              <TableCell style={{ width: columnWidths.vendor }}>
                {request.doc_selected_vendor || '—'}
              </TableCell>
              <TableCell style={{ width: columnWidths.attachment }}>
                <FileAttachmentCell request={request} />
              </TableCell>
              <TableCell style={{ width: columnWidths.status }}>
                <DocRequestStatusBadge status={request.doc_status} />
              </TableCell>
              <TableCell style={{ width: columnWidths.dueDate }}>
                {request.doc_due_date ? format(new Date(request.doc_due_date), 'MMM d, yyyy') : '—'}
              </TableCell>
              <TableCell style={{ width: columnWidths.created }}>
                {format(new Date(request.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell style={{ width: columnWidths.actions }} className="text-right">
                <DocPrintingActions
                  request={request}
                  onEdit={() => onEdit(request)}
                  onDelete={() => onDelete(request)}
                  onStatusChange={(status) => onStatusChange(request.id, status)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
