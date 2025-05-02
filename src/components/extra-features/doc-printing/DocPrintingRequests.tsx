
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DocRequest, DocStatus } from './api/docRequestsApi';
import { DocRequestStatusBadge } from './DocRequestStatusBadge';
import { format } from 'date-fns';

interface DocPrintingRequestsProps {
  requests: DocRequest[];
  onEdit: (request: DocRequest) => void;
  onDelete: (request: DocRequest) => void;
  onStatusChange: (requestId: string, status: DocStatus) => void;
}

export const DocPrintingRequests: React.FC<DocPrintingRequestsProps> = ({
  requests,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<DocRequest | null>(null);

  const handleDeleteClick = (request: DocRequest) => {
    setRequestToDelete(request);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (requestToDelete) {
      onDelete(requestToDelete);
      setDeleteConfirmOpen(false);
      setRequestToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Process Range</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No document requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.doc_title}
                    {request.doc_type === 'SLB' && request.doc_version && (
                      <span className="ml-1 text-xs text-gray-500">
                        (v{request.doc_version})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.doc_request_type === 'printing' ? 'Printing' : 'Proposal'}
                  </TableCell>
                  <TableCell>
                    {request.doc_type === 'SLB' && request.doc_process_number_range ? 
                      request.doc_process_number_range : '-'}
                  </TableCell>
                  <TableCell>{request.doc_delivery_address || '-'}</TableCell>
                  <TableCell>
                    {request.doc_due_date
                      ? format(new Date(request.doc_due_date), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <DocRequestStatusBadge status={request.doc_status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(request)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(request)}>
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={request.doc_status === 'pending'}
                            onClick={() => onStatusChange(request.id, 'pending')}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={request.doc_status === 'approved'}
                            onClick={() => onStatusChange(request.id, 'approved')}
                          >
                            Mark as Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={request.doc_status === 'completed'}
                            onClick={() => onStatusChange(request.id, 'completed')}
                          >
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={request.doc_status === 'cancelled'}
                            onClick={() => onStatusChange(request.id, 'cancelled')}
                          >
                            Mark as Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document request "{requestToDelete?.doc_title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
