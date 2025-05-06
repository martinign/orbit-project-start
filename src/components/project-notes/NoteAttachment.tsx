
import React from 'react';
import { FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bytesToSize } from '@/utils/file-utils';
import { supabase } from '@/integrations/supabase/client';

interface NoteAttachmentProps {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number | null;
}

const NoteAttachment: React.FC<NoteAttachmentProps> = ({
  fileName,
  filePath,
  fileType,
  fileSize
}) => {
  const isImage = fileType && fileType.startsWith('image/');

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('project-attachments')
        .download(filePath);
      
      if (error) {
        console.error('Error downloading file:', error);
        return;
      }
      
      // Create a URL for the blob and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error in download process:', error);
    }
  };

  // For image files, we'll show a preview
  if (isImage) {
    return (
      <div className="mt-2 border rounded-md p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
        <div className="relative h-40 w-full bg-gray-100 rounded overflow-hidden">
          <img 
            src={`https://ukmkxsflqcreenxpdhke.supabase.co/storage/v1/object/public/project-attachments/${filePath}`}
            alt={fileName}
            className="h-full w-full object-contain"
          />
        </div>
        {fileSize && (
          <div className="mt-1 text-xs text-gray-500">
            {bytesToSize(fileSize)}
          </div>
        )}
      </div>
    );
  }

  // For non-image files, show a simple interface
  return (
    <div className="mt-2 border rounded-md p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm font-medium">{fileName}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Download</span>
        </Button>
      </div>
      {fileSize && (
        <div className="mt-1 text-xs text-gray-500">
          {bytesToSize(fileSize)}
        </div>
      )}
    </div>
  );
};

export default NoteAttachment;
