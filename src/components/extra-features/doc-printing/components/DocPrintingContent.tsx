
import React from 'react';
import { DocRequest, DocStatus } from '../api/docRequestsApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DocRequestStatusBadge } from '../DocRequestStatusBadge';
import { DocPrintingActions } from '../DocPrintingActions';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AuthWarning } from './AuthWarning';

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

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.doc_title}</TableCell>
              <TableCell>
                <Badge variant={request.doc_type === 'SLB' ? 'default' : 'secondary'}>
                  {request.doc_type}
                </Badge>
              </TableCell>
              <TableCell>{request.doc_amount}</TableCell>
              <TableCell>
                <DocRequestStatusBadge status={request.doc_status} />
              </TableCell>
              <TableCell>
                {request.doc_due_date ? format(new Date(request.doc_due_date), 'MMM d, yyyy') : '-'}
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
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
