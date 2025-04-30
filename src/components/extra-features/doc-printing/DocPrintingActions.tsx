
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocPrintingActionsProps {
  selectedTemplate: string;
}

export const DocPrintingActions: React.FC<DocPrintingActionsProps> = ({ selectedTemplate }) => {
  const { toast } = useToast();

  const handlePrint = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a document template to print",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Document sent to printer",
      description: "Your document has been sent to the default printer",
    });
  };

  const handleDownload = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a document template to download",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Document ready for download",
      description: "Your document will download shortly",
    });
  };

  const handlePreview = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a document template to preview",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Document preview",
      description: "Preview functionality coming soon",
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      <Button onClick={handlePrint} className="flex items-center gap-2">
        <Printer className="h-4 w-4" />
        Print Document
      </Button>
      <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
        <FileDown className="h-4 w-4" />
        Download PDF
      </Button>
      <Button onClick={handlePreview} variant="secondary" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Preview
      </Button>
    </div>
  );
};
