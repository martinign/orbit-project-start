import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createStorageFilePath } from '@/utils/file-utils';

export function useNoteOperations(projectId: string) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // Keep isPrivate for database compatibility, but set it always to false
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadFile = async (file: File, userId: string) => {
    if (!file) return null;
    
    try {
      const filePath = createStorageFilePath(userId, file.name);
      
      const { error: uploadError } = await supabase.storage
        .from('project-attachments')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }
      
      return {
        filePath,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      };
    } catch (error) {
      console.error("Error in file upload:", error);
      throw error;
    }
  };

  const saveNewNote = async (data: { 
    title: string; 
    content: string; 
    file?: File | null;
  }) => {
    if (!projectId || !user) {
      toast({
        title: 'Error',
        description: 'User ID or Project ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      let fileData = null;
      
      // Handle file upload if there's a file
      if (data.file) {
        fileData = await uploadFile(data.file, user.id);
      }
      
      const { data: savedData, error } = await supabase
        .from('project_notes')
        .insert({
          project_id: projectId,
          title: data.title,
          content: data.content,
          user_id: user.id,
          is_private: false, // Always set to false now that we've removed the feature
          ...(fileData ? {
            file_path: fileData.filePath,
            file_name: fileData.fileName,
            file_type: fileData.fileType,
            file_size: fileData.fileSize
          } : {})
        })
        .select();
        
      if (error) {
        console.error('Error creating note:', error);
        throw error;
      }
      
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_notes_count', projectId] });
      queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
      return savedData;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note. Please check your permissions.',
        variant: 'destructive',
      });
    }
  };

  const updateNote = async (data?: { file?: File | null }) => {
    if (!selectedNote || !user) return;
    
    try {
      let fileData = null;
      
      // If a new file was uploaded
      if (data?.file) {
        fileData = await uploadFile(data.file, user.id);
      }
      
      // Delete old file if it exists and a new one is being uploaded
      if (fileData && selectedNote.file_path) {
        const { error: deleteError } = await supabase.storage
          .from('project-attachments')
          .remove([selectedNote.file_path]);
          
        if (deleteError) {
          console.warn('Error removing old file:', deleteError);
        }
      }
      
      const { data: updatedData, error } = await supabase
        .from('project_notes')
        .update({
          title,
          content,
          is_private: false, // Always set to false now that we've removed the feature
          updated_at: new Date().toISOString(),
          ...(fileData ? {
            file_path: fileData.filePath,
            file_name: fileData.fileName,
            file_type: fileData.fileType,
            file_size: fileData.fileSize
          } : {})
        })
        .eq('id', selectedNote.id)
        .select();
        
      if (error) {
        console.error('Error updating note:', error);
        throw error;
      }
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_notes_count', projectId] });
      return updatedData;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note. Please check your permissions.',
        variant: 'destructive',
      });
    }
  };

  const deleteNote = async () => {
    if (!selectedNote) return;
    
    try {
      // Delete the associated file if there is one
      if (selectedNote.file_path) {
        const { error: deleteFileError } = await supabase.storage
          .from('project-attachments')
          .remove([selectedNote.file_path]);
          
        if (deleteFileError) {
          console.warn('Error removing file:', deleteFileError);
        }
      }
      
      const { data, error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', selectedNote.id)
        .select();
        
      if (error) {
        console.error('Error deleting note:', error);
        throw error;
      }
      
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_notes_count', projectId] });
      queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
      return data;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please check your permissions.',
        variant: 'destructive',
      });
    }
  };

  return {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedNote,
    setSelectedNote,
    title,
    setTitle,
    content,
    setContent,
    isPrivate, // Keep for backward compatibility
    setIsPrivate, // Keep for backward compatibility
    attachmentFile,
    setAttachmentFile,
    saveNewNote,
    updateNote,
    deleteNote,
  };
}
