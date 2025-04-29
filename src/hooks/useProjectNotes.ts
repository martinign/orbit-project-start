
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ProjectNote = {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export function useProjectNotes(projectId: string) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['project_notes', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_notes')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching project notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project notes',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (notesData) {
      setNotes(notesData);
    }
  }, [notesData]);

  // Add real-time subscription for all events (INSERT, UPDATE, DELETE)
  useEffect(() => {
    if (!projectId) return;
    
    const channel = supabase.channel(`notes_changes_${projectId}`)
      .on('postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'project_notes',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Project notes change detected:', payload);
          // Invalidate the queries to trigger a refresh of both notes and notes count
          queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
          queryClient.invalidateQueries({ queryKey: ['project_notes_count', projectId] });
          queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return {
    notes,
    isLoading: isLoading || notesLoading,
    setNotes,
  };
}
