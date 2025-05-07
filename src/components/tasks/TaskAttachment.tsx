
import React from 'react';
import { FileIcon, ExternalLink } from 'lucide-react';
import { bytesToSize } from '@/utils/file-utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface TaskAttachmentProps {
  fileName: string | null;
  filePath: string | null;
  fileType: string | null;
  fileSize: number | null;
}

const TaskAttachment: React.FC<TaskAttachmentProps> = ({ 
  fileName, 
  filePath, 
  fileType,
  fileSize
}) => {
  if (!fileName || !filePath) return null;

  const handleDownload = async () => {
    try {
      // Get file download URL
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .createSignedUrl(filePath, 60); // 60 seconds expiry
        
      if (error) {
        console.error("Error getting download URL:", error);
        return;
      }
      
      // Open the file in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  
  return (
    <div className="mt-2 pt-2 border-t">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center p-1 hover:bg-gray-100 w-full justify-start" 
        onClick={handleDownload}
      >
        <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium truncate max-w-[180px]">{fileName}</span>
          <span className="text-xs text-gray-500">
            {fileSize ? bytesToSize(fileSize) : fileType || 'File'}
            <ExternalLink className="inline-block h-3 w-3 ml-1" />
          </span>
        </div>
      </Button>
    </div>
  );
};

export default TaskAttachment;
