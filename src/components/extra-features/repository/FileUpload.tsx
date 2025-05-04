
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  projectId: string;
  onUploadComplete: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ projectId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user || !projectId) return;
    
    setUploading(true);
    const newUploadProgress: Record<string, number> = {};
    acceptedFiles.forEach(file => {
      newUploadProgress[file.name] = 0;
    });
    setUploadProgress(newUploadProgress);
    
    try {
      for (const file of acceptedFiles) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const filePath = `${projectId}/${Date.now()}-${file.name}`;
        
        // Create a custom upload function to track progress
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-attachments')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Update progress to 100% for completed uploads
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
        
        // Create record in project_attachments table
        const { error: dbError } = await supabase.from('project_attachments').insert({
          project_id: projectId,
          related_id: projectId, // Using projectId as the related_id for repository files
          related_type: 'repository',
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          created_by: user.id
        });
        
        if (dbError) {
          throw dbError;
        }
      }
      
      toast({
        title: "Success",
        description: `${acceptedFiles.length} file(s) uploaded successfully`
      });
      
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 2000); // Clear progress after 2 seconds
    }
  }, [projectId, user, toast, onUploadComplete]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: uploading
  });
  
  return (
    <div className="mb-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          {uploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : (
            <>
              <p className="text-sm font-medium">Drag & drop files here, or click to select files</p>
              <p className="text-xs text-gray-500">
                Upload any type of file. Max size: 50MB per file.
              </p>
            </>
          )}
        </div>
      </div>
      
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="truncate">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}
      
      {uploading && (
        <div className="mt-4 flex justify-center">
          <Button disabled className="text-xs">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </Button>
        </div>
      )}
    </div>
  );
};
