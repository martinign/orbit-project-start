
import React from "react";
import { Label } from "@/components/ui/label";
import { BookTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
  label: string;
  mode: "create" | "edit";
  onOpenTemplateDialog?: () => void;
}

const FormHeader = ({ label, mode, onOpenTemplateDialog }: FormHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <Label htmlFor="title">{label}</Label>
      {mode === "create" && onOpenTemplateDialog && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenTemplateDialog}
          className="flex items-center gap-1"
        >
          <BookTemplate className="h-4 w-4" />
          Use Template
        </Button>
      )}
    </div>
  );
};

export default FormHeader;
