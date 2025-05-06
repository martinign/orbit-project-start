
import React, { useState, useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';
import { useDropzone } from 'react-dropzone';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bytesToSize } from '@/utils/file-utils';

interface FileUploadFieldProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({ form, isSubmitting }) => {
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPreviewFile(file);
      form.setValue('doc_file', file);
      form.setValue('doc_file_name', file.name);
      form.setValue('doc_file_type', file.type);
      form.setValue('doc_file_size', file.size);
    }
  }, [form]);

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
    setPreviewFile(null);
    form.setValue('doc_file', null);
    form.setValue('doc_file_name', '');
    form.setValue('doc_file_type', '');
    form.setValue('doc_file_size', null);
  };

  return (
    <FormField
      control={form.control}
      name="doc_file"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Attachment</FormLabel>
          <FormControl>
            <div className="w-full">
              {!previewFile ? (
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
                        <p className="font-medium truncate max-w-[250px]">{previewFile.name}</p>
                        <p className="text-xs text-gray-500">{bytesToSize(previewFile.size)}</p>
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
