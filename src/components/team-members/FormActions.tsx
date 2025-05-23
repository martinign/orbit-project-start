
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  buttonClassName?: string;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  isSubmitting, 
  isEditMode,
  buttonClassName = "bg-blue-500 hover:bg-blue-600 text-white"
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className={buttonClassName}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? "Update Team Member" : "Add Team Member"}
      </Button>
    </div>
  );
};

export default FormActions;
