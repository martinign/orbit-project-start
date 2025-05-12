
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote } from '@/types/sticky-notes';

export const useFetchNotes = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch all notes for the current user
  const fetchNotes = async () => {
    if (!userId) return [];
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Fetched notes:', data);
      return data || [];
    } catch (err: any) {
      console.error('Error fetching sticky notes:', err);
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchNotes,
    isLoading,
    error
  };
};
