
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
  doc_file_path?: string | null;
  doc_file_name?: string | null;
  doc_file_type?: string | null;
  doc_file_size?: number | null;
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
      
      // Update the count based on actual data
      if (data && data.length !== updateCount) {
        setUpdateCount(data.length);
      }
      
      return data as DocRequestUpdate[];
    },
    enabled: !!docRequestId
  });

  // Add a new update
  const addUpdate = useMutation({
    mutationFn: async ({ content, file }: { content: string, file?: File }) => {
      if (!user) throw new Error('You must be logged in to add updates');
      if (!docRequestId) throw new Error('Document request ID is required');
      
      // Initialize the update data
      const updateData: any = {
        doc_request_id: docRequestId,
        user_id: user.id,
        content
      };
      
      // Handle file upload if a file is provided
      if (file) {
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const filePath = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;
        
        // Upload file to Supabase Storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('doc-files')
          .upload(filePath, file);
        
        if (fileError) throw fileError;
        
        // Add file info to the update data
        updateData.doc_file_path = filePath;
        updateData.doc_file_name = file.name;
        updateData.doc_file_type = file.type;
        updateData.doc_file_size = file.size;
      }
      
      // Insert the update into the database
      const { data, error } = await supabase
        .from('project_doc_request_updates')
        .insert(updateData)
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
      queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      console.error('Error marking updates as viewed:', error);
    }
  };

  // Set up real-time subscription for updates
  useEffect(() => {
    if (docRequestId) {
      // Initial fetch of update count
      const fetchUpdateCount = async () => {
        try {
          const { data, error } = await supabase
            .from('project_doc_request_updates')
            .select('*')
            .eq('doc_request_id', docRequestId);
          
          if (error) throw error;
          setUpdateCount(data?.length || 0);
        } catch (error) {
          console.error('Error fetching updates:', error);
        }
      };
      
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
            // Invalidate query to refetch updates when changes occur
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
    updateCount: updates?.length || 0, // Ensure count matches actual updates length
    isLoading: isLoading || isUpdatesLoading,
    addUpdate: addUpdate.mutate,
    isSubmitting: addUpdate.isPending,
    markUpdatesAsViewed
  };
};
