
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { bytesToSize } from '@/utils/file-utils';

interface TaskFileUploadFieldProps {
  fileAttachment: File | null;
  setFileAttachment: (file: File | null) => void;
  setFileName: (name: string) => void;
  setFileType: (type: string) => void;
  setFileSize: (size: number | null) => void;
  existingFileName?: string;
  existingFileType?: string;
  existingFileSize?: number | null;
  isSubmitting: boolean;
  label?: string;
}

const TaskFileUploadField: React.FC<TaskFileUploadFieldProps> = ({
  fileAttachment,
  setFileAttachment,
  setFileName,
  setFileType,
  setFileSize,
  existingFileName,
  existingFileType,
  existingFileSize,
  isSubmitting,
  label = "Attachment"
}) => {
  const [hasExistingFile] = useState<boolean>(
    !!(existingFileName && existingFileType)
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileAttachment(file);
      setFileName(file.name);
      setFileType(file.type);
      setFileSize(file.size);
    }
  }, [setFileAttachment, setFileName, setFileType, setFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    disabled: isSubmitting,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const removeFile = () => {
    setFileAttachment(null);
    setFileName('');
    setFileType('');
    setFileSize(null);
  };

  const displayFile = fileAttachment || (hasExistingFile && !fileAttachment);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="w-full">
        {!displayFile ? (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-md p-6 text-center transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary'
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <UploadIcon className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-500">
                {isDragActive ? (
                  <p>Drop the file here</p>
                ) : (
                  <>
                    <p className="font-medium">Drop file here or click to upload</p>
                    <p className="text-xs">PDF, Word, Excel, and image files supported</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileIcon className="h-8 w-8 text-blue-500" />
                <div className="text-sm">
                  <p className="font-medium truncate max-w-[250px]">
                    {fileAttachment ? fileAttachment.name : existingFileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fileAttachment 
                      ? bytesToSize(fileAttachment.size)
                      : existingFileSize ? bytesToSize(existingFileSize) : existingFileType
                    }
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={removeFile} 
                disabled={isSubmitting}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFileUploadField;
