
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { WorkdayCode } from '@/utils/workdayCodeUtils';

interface DeleteCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codeToDelete: WorkdayCode | null;
  onConfirm: () => void;
}

const DeleteCodeDialog: React.FC<DeleteCodeDialogProps> = ({ 
  open, 
  onOpenChange, 
  codeToDelete, 
  onConfirm 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this workday code and all project associations. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCodeDialog;
