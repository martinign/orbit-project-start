
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

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

  // Add real-time subscription
  useRealtimeSubscription({
    table: 'project_notes',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
      }, 100);
    }
  });

  return {
    notes,
    isLoading: isLoading || notesLoading,
    setNotes,
  };
}

