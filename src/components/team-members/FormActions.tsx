
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

const FormActions = ({ onCancel, isSubmitting, isEditMode }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-purple-500 hover:bg-purple-600"
      >
        {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add Team Member"}
      </Button>
    </div>
  );
};

export default FormActions;
