
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocPrintingRequestForm } from './DocPrintingRequestForm';
import { DocRequest, NewDocRequest } from './api/docRequestsApi';

interface DocPrintingRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewDocRequest) => void;
  projectId: string;
  initialData?: DocRequest;
  isSubmitting: boolean;
}

export const DocPrintingRequestDialog: React.FC<DocPrintingRequestDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  initialData,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Document Request' : 'New Document Request'}</DialogTitle>
        </DialogHeader>
        
        <DocPrintingRequestForm
          initialData={initialData}
          projectId={projectId}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
