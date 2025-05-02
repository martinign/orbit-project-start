
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useNoteOperations(projectId: string) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const saveNewNote = async (data: { title: string; content: string }) => {
    if (!projectId || !user) {
      toast({
        title: 'Error',
        description: 'User ID or Project ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data: savedData, error } = await supabase
        .from('project_notes')
        .insert({
          project_id: projectId,
          title: data.title,
          content: data.content,
          user_id: user.id,
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

  const updateNote = async () => {
    if (!selectedNote || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('project_notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
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
      return data;
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
    saveNewNote,
    updateNote,
    deleteNote,
  };
}
