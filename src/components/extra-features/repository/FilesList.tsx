
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Download, Trash2, FileIcon, Image, FileText, Film, Music, File } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface File {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  created_by: string;
}

interface FilesListProps {
  files: File[];
  isLoading: boolean;
  onDelete: () => void;
}

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get appropriate icon based on file type
const getFileIcon = (fileType: string) => {
  if (fileType?.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (fileType?.startsWith('text/')) return <FileText className="h-4 w-4" />;
  if (fileType?.startsWith('video/')) return <Film className="h-4 w-4" />;
  if (fileType?.startsWith('audio/')) return <Music className="h-4 w-4" />;
  return <FileIcon className="h-4 w-4" />;
};

export const FilesList: React.FC<FilesListProps> = ({ files, isLoading, onDelete }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  // Function to download a file
  const downloadFile = async (file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-attachments')
        .download(file.file_path);
        
      if (error) throw error;
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `Downloading ${file.file_name}`
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  // Function to delete a file
  const deleteFile = async (file: File) => {
    if (!user) return;
    
    try {
      setDeleting(file.id);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-attachments')
        .remove([file.file_path]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('project_attachments')
        .delete()
        .eq('id', file.id);
        
      if (dbError) throw dbError;
      
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
      
      onDelete(); // Refresh file list
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Function to get public URL for file preview
  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('project-attachments')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  const renderFilePreview = (file: File) => {
    const isImage = file.file_type?.startsWith('image/');
    
    if (isImage) {
      const url = getFileUrl(file.file_path);
      return (
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2 rounded overflow-hidden">
            <img 
              src={url} 
              alt={file.file_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }} 
            />
          </div>
          {file.file_name}
        </div>
      );
    }
    
    return (
      <div className="flex items-center">
        <div className="mr-2 text-gray-500">
          {getFileIcon(file.file_type)}
        </div>
        {file.file_name}
      </div>
    );
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading files...</div>;
  }

  if (files.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <File className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <h3 className="font-medium mb-1">No files uploaded yet</h3>
        <p className="text-sm">Upload files using the form above</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">File name</TableHead>
            <TableHead className="w-[15%]">Size</TableHead>
            <TableHead className="w-[15%]">Type</TableHead>
            <TableHead className="w-[20%]">Uploaded</TableHead>
            <TableHead className="w-[10%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{renderFilePreview(file)}</TableCell>
              <TableCell>{formatFileSize(file.file_size)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {file.file_type?.split('/')[1] || 'unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadFile(file)}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {user?.id === file.created_by && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFile(file)}
                      title="Delete file"
                      disabled={deleting === file.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
