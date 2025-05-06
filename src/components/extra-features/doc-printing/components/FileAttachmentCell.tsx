
import React from 'react';
import { FileIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client'; 
import { DocRequest } from '../api/docRequestsApi';

interface FileAttachmentCellProps {
  request: DocRequest;
}

export const FileAttachmentCell: React.FC<FileAttachmentCellProps> = ({ request }) => {
  const hasFile = request.doc_file_path && request.doc_file_name;
  
  const downloadFile = async () => {
    if (!request.doc_file_path) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('doc-files')
        .download(request.doc_file_path);
      
      if (error) {
        console.error('Error downloading file:', error);
        return;
      }
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = request.doc_file_name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error processing download:', error);
    }
  };

  if (!hasFile) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <FileIcon className="h-4 w-4 text-blue-500" />
      <span className="truncate max-w-[100px]" title={request.doc_file_name}>
        {request.doc_file_name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={downloadFile}
        title="Download file"
      >
        <ExternalLinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
