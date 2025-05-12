
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote } from '@/types/sticky-notes';

export const useStickyNotesActions = (userId: string | undefined) => {
  // Create a new sticky note
  const createNote = async (noteData: Omit<StickyNote, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'position' | 'is_archived'>, notes: StickyNote[]) => {
    if (!userId) return null;
    
    try {
      const position = notes.length > 0 ? Math.max(...notes.map(note => note.position)) + 1 : 0;
      
      const { data, error } = await supabase
        .from('sticky_notes')
        .insert([{
          ...noteData,
          user_id: userId,
          position,
          is_archived: false
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Note created",
        description: "Your sticky note has been created successfully.",
      });
      
      return data?.[0] || null;
    } catch (err: any) {
      console.error('Error creating sticky note:', err);
      toast({
        title: "Error creating note",
        description: err.message || "There was a problem creating your sticky note.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing sticky note
  const updateNote = async (id: string, noteData: Partial<StickyNote>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .update({
          ...noteData,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Note updated",
        description: "Your sticky note has been updated successfully.",
      });
      
      return data?.[0] || null;
    } catch (err: any) {
      console.error('Error updating sticky note:', err);
      toast({
        title: "Error updating note",
        description: err.message || "There was a problem updating your sticky note.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Archive a note (soft delete)
  const archiveNote = async (id: string) => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update({ is_archived: true })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Note archived",
        description: "Your sticky note has been archived.",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error archiving sticky note:', err);
      toast({
        title: "Error archiving note",
        description: err.message || "There was a problem archiving your sticky note.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Hard delete a note
  const deleteNote = async (id: string) => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Note deleted",
        description: "Your sticky note has been deleted.",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting sticky note:', err);
      toast({
        title: "Error deleting note",
        description: err.message || "There was a problem deleting your sticky note.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createNote,
    updateNote,
    archiveNote,
    deleteNote
  };
};
