
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormHeader from "./FormHeader";

interface BasicInfoSectionProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  mode: "create" | "edit";
  onOpenTemplateDialog?: () => void;
}

const BasicInfoSection = ({
  title,
  setTitle,
  description,
  setDescription,
  mode,
  onOpenTemplateDialog,
}: BasicInfoSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <FormHeader 
          label="Title" 
          mode={mode} 
          onOpenTemplateDialog={onOpenTemplateDialog} 
        />
        <Input
          id="title"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
};

export default BasicInfoSection;
