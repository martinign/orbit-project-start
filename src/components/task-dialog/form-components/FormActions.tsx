
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FormActionsProps {
  onClose: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

const FormActions = ({ onClose, isSubmitting, mode }: FormActionsProps) => {
  return (
    <DialogFooter className="mt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onClose} 
        disabled={isSubmitting}
        className="mr-2"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isSubmitting 
          ? "Saving..." 
          : mode === "edit" 
            ? "Save changes" 
            : "Create task"
        }
      </Button>
    </DialogFooter>
  );
};

export default FormActions;
