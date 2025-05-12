
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote } from '@/types/sticky-notes';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export const useRealtimeNotes = (
  userId: string | undefined, 
  setNotes: React.Dispatch<React.SetStateAction<StickyNote[]>>
) => {
  useEffect(() => {
    if (!userId) return;
    
    // Create a unique channel name with timestamp to ensure fresh connection
    const channelName = `sticky-notes-channel-${Date.now()}`;
    
    console.log(`Setting up realtime channel: ${channelName} for user ${userId}`);
    
    // Create a channel for real-time updates
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sticky_notes',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<StickyNote>) => {
          console.log('Received INSERT update:', payload);
          const newNote = payload.new as StickyNote;
          // Add the new note to the existing notes array
          setNotes(prevNotes => {
            // Check if note already exists to avoid duplicates
            if (prevNotes.find(note => note.id === newNote.id)) {
              return prevNotes;
            }
            return [...prevNotes, newNote];
          });
          
          toast({
            title: "Note created",
            description: "A new sticky note has been created.",
          });
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
        (payload: RealtimePostgresChangesPayload<StickyNote>) => {
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
        (payload: RealtimePostgresChangesPayload<StickyNote>) => {
          console.log('Received DELETE update:', payload);
          const deletedNoteId = payload.old?.id;
          if (deletedNoteId) {
            setNotes(prevNotes => prevNotes.filter(note => note.id !== deletedNoteId));
            
            toast({
              title: "Note deleted",
              description: "A sticky note has been deleted.",
            });
          }
        }
      );
    
    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`Supabase channel status: ${status}`, channel.state);
      
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to sticky notes channel!');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to sticky notes channel', channel.state);
        toast({
          title: "Connection Error",
          description: "Could not connect to real-time updates. Changes may not appear automatically.",
          variant: "destructive",
        });
      }
    });

    // Cleanup function - make sure to properly remove the channel
    return () => {
      console.log(`Removing channel: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [userId, setNotes]);
};
