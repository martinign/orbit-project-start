
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TemplateOption {
  id: string;
  name: string;
}

interface DocPrintingTemplatesProps {
  templates: TemplateOption[];
  selectedTemplate: string;
  setSelectedTemplate: (value: string) => void;
}

export const DocPrintingTemplates: React.FC<DocPrintingTemplatesProps> = ({
  templates,
  selectedTemplate,
  setSelectedTemplate
}) => {
  return (
    <div>
      <Label htmlFor="template-select">Select Template</Label>
      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
        <SelectTrigger id="template-select" className="w-full">
          <SelectValue placeholder="Select a document template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
