
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export type StickyNote = {
  id: string;
  title: string;
  content: string | null;
  color: string;
  position: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export const useStickyNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch all notes for the current user
  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNotes(data || []);
    } catch (err: any) {
      console.error('Error fetching sticky notes:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new sticky note
  const createNote = async (noteData: Omit<StickyNote, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'position' | 'is_archived'>) => {
    if (!user) return null;
    
    try {
      const position = notes.length > 0 ? Math.max(...notes.map(note => note.position)) + 1 : 0;
      
      const { data, error } = await supabase
        .from('sticky_notes')
        .insert([{
          ...noteData,
          user_id: user.id,
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
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .update({
          ...noteData,
        })
        .eq('id', id)
        .eq('user_id', user.id)
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
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update({ is_archived: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
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
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
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

  // Subscribe to realtime changes
  useRealtimeSubscription({
    table: 'sticky_notes' as any, // Type assertion to fix the TypeScript error
    filter: 'user_id',
    filterValue: user?.id,
    onRecordChange: () => {
      fetchNotes();
    },
  });

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    archiveNote,
    deleteNote,
    refresh: fetchNotes,
  };
};
