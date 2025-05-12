
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StickyNote } from '@/types/sticky-notes';
import { useFetchNotes } from './sticky-notes/useFetchNotes';
import { useStickyNotesActions } from './sticky-notes/useStickyNotesActions';
import { useRealtimeNotes } from './sticky-notes/useRealtimeNotes';

export type { StickyNote } from '@/types/sticky-notes';

export const useStickyNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const { fetchNotes, isLoading, error } = useFetchNotes(user?.id);
  const { createNote, updateNote, archiveNote, deleteNote } = useStickyNotesActions(user?.id);

  // Set up real-time subscription
  useRealtimeNotes(user?.id, setNotes);

  // Initial fetch of notes
  useEffect(() => {
    const loadNotes = async () => {
      if (user) {
        const fetchedNotes = await fetchNotes();
        setNotes(fetchedNotes);
      }
    };
    
    loadNotes();
  }, [user]);

  return {
    notes,
    isLoading,
    error,
    createNote: (noteData: Omit<StickyNote, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'position' | 'is_archived'>) => 
      createNote(noteData, notes),
    updateNote,
    archiveNote,
    deleteNote,
    refresh: async () => {
      const fetchedNotes = await fetchNotes();
      setNotes(fetchedNotes);
    }
  };
};
