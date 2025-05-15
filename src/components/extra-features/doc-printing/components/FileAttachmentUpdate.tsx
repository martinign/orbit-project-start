
import React from 'react';
import { FileIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client'; 
import { DocRequestUpdate } from '../hooks/useDocRequestUpdates';
import { bytesToSize } from '@/utils/file-utils';

interface FileAttachmentUpdateProps {
  update: DocRequestUpdate;
}

export const FileAttachmentUpdate: React.FC<FileAttachmentUpdateProps> = ({ update }) => {
  const hasFile = update.doc_file_path && update.doc_file_name;
  
  const downloadFile = async () => {
    if (!update.doc_file_path) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('doc-files')
        .download(update.doc_file_path);
      
      if (error) {
        console.error('Error downloading file:', error);
        return;
      }
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = update.doc_file_name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error processing download:', error);
    }
  };

  if (!hasFile) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2 bg-muted/30 p-2 rounded">
      <FileIcon className="h-4 w-4 text-blue-500" />
      <span className="truncate max-w-[150px]" title={update.doc_file_name}>
        {update.doc_file_name}
      </span>
      {update.doc_file_size && (
        <span className="text-xs text-muted-foreground">
          {bytesToSize(update.doc_file_size)}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto h-6 w-6 p-0"
        onClick={downloadFile}
        title="Download attachment"
      >
        <ExternalLinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
