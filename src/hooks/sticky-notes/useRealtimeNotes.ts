
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote } from '@/types/sticky-notes';

export const useRealtimeNotes = (
  userId: string | undefined, 
  setNotes: React.Dispatch<React.SetStateAction<StickyNote[]>>
) => {
  useEffect(() => {
    if (!userId) return;
    
    // Create a channel for real-time updates
    const channel = supabase
      .channel('sticky-notes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sticky_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Received INSERT update:', payload);
          const newNote = payload.new as StickyNote;
          // Add the new note to the existing notes array
          setNotes(prevNotes => [...prevNotes, newNote]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sticky_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Received UPDATE update:', payload);
          const updatedNote = payload.new as StickyNote;
          // If it's archived, remove it from the list, otherwise update it
          if (updatedNote.is_archived) {
            setNotes(prevNotes => prevNotes.filter(note => note.id !== updatedNote.id));
          } else {
            setNotes(prevNotes => 
              prevNotes.map(note => 
                note.id === updatedNote.id ? updatedNote : note
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'sticky_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Received DELETE update:', payload);
          const deletedNoteId = payload.old?.id;
          if (deletedNoteId) {
            setNotes(prevNotes => prevNotes.filter(note => note.id !== deletedNoteId));
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase channel status:', status);
      });

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setNotes]);
};
