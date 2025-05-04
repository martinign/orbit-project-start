
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface DocPrintingHeaderProps {
  onNewRequest: () => void;
  isDisabled: boolean;
}

export const DocPrintingHeader: React.FC<DocPrintingHeaderProps> = ({ 
  onNewRequest, 
  isDisabled 
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-medium">Document Printing</CardTitle>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onNewRequest}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isDisabled}
        >
          <Plus className="h-4 w-4 mr-1" /> New Request
        </Button>
      </div>
    </CardHeader>
  );
};
