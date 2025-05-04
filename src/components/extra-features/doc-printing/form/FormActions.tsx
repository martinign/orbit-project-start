
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  isSubmitting,
  isEdit
}) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : isEdit ? 'Update Request' : 'Create Request'}
      </Button>
    </div>
  );
};
