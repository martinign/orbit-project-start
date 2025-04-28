
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useNoteOperations(projectId: string) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveNewNote = async (userId: string) => {
    if (!projectId || !userId) {
      toast({
        title: 'Error',
        description: 'User ID or Project ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .insert({
          project_id: projectId,
          title,
          content,
          user_id: userId,
        });
        
      if (error) throw error;
      
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note',
        variant: 'destructive',
      });
    }
  };

  const updateNote = async () => {
    if (!selectedNote) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedNote.id);
        
      if (error) throw error;
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note',
        variant: 'destructive',
      });
    }
  };

  const deleteNote = async () => {
    if (!selectedNote) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', selectedNote.id);
        
      if (error) throw error;
      
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
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

