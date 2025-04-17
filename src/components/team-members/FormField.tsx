
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  icon?: LucideIcon;
  type?: string;
  className?: string;
  disabled?: boolean;
}

const FormField = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  hint,
  icon: Icon,
  type = "text",
  className,
  disabled = false,
}: FormFieldProps) => {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1"
        required={required}
        type={type}
        disabled={disabled}
      />
      {hint && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {Icon && <Icon className="h-3 w-3" />}
          {hint}
        </p>
      )}
    </div>
  );
};

export default FormField;
