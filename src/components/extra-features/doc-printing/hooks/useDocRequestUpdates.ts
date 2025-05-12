
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface DocRequestUpdate {
  id: string;
  doc_request_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useDocRequestUpdates = (docRequestId: string) => {
  const [updateCount, setUpdateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query key for this specific request's updates
  const queryKey = ['doc-request-updates', docRequestId];

  // Fetch updates for a specific document request
  const { data: updates = [], isLoading: isUpdatesLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!docRequestId) return [];
      
      const { data, error } = await supabase
        .from('project_doc_request_updates')
        .select('*')
        .eq('doc_request_id', docRequestId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DocRequestUpdate[];
    },
    enabled: !!docRequestId
  });

  // Fetch update count
  const fetchUpdateCount = async () => {
    if (!docRequestId) return;
    
    setIsLoading(true);
    try {
      const { count, error } = await supabase
        .from('project_doc_request_updates')
        .select('*', { count: 'exact', head: true })
        .eq('doc_request_id', docRequestId);

      if (error) throw error;
      setUpdateCount(count || 0);
    } catch (error) {
      console.error('Error fetching update count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new update
  const addUpdate = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('You must be logged in to add updates');
      if (!docRequestId) throw new Error('Document request ID is required');
      
      const { data, error } = await supabase
        .from('project_doc_request_updates')
        .insert({
          doc_request_id: docRequestId,
          user_id: user.id,
          content
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return data as DocRequestUpdate;
    },
    onSuccess: () => {
      toast.success('Update added successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Failed to add update: ${error.message || 'An error occurred'}`);
    }
  });

  // Mark updates as viewed (placeholder for future functionality)
  const markUpdatesAsViewed = async () => {
    try {
      // In a future enhancement, this would update a 'viewed' flag in the database
      // For now, we'll just refetch to ensure the count is current
      await fetchUpdateCount();
      // Invalidate any queries that might be caching update counts
      queryClient.invalidateQueries({ queryKey: ['doc-request-updates', docRequestId] });
    } catch (error) {
      console.error('Error marking updates as viewed:', error);
    }
  };

  // Set up real-time subscription for updates
  useEffect(() => {
    if (docRequestId) {
      fetchUpdateCount();
      
      const channel = supabase
        .channel(`doc-updates-${docRequestId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'project_doc_request_updates',
            filter: `doc_request_id=eq.${docRequestId}`
          },
          () => {
            fetchUpdateCount();
            // Also invalidate any queries
            queryClient.invalidateQueries({ queryKey });
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [docRequestId, queryClient]);

  return {
    updates,
    updateCount,
    isLoading: isLoading || isUpdatesLoading,
    addUpdate: addUpdate.mutate,
    isSubmitting: addUpdate.isPending,
    markUpdatesAsViewed
  };
};
