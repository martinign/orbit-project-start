
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface RepositoryFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  created_by: string;
}

export function useRepositoryFiles(projectId?: string) {
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFiles = async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('project_attachments')
        .select('*')
        .eq('project_id', projectId)
        .eq('related_type', 'repository')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setFiles(data as RepositoryFile[]);
    } catch (err) {
      console.error('Error fetching repository files:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFiles();
  }, [projectId]);
  
  // Set up realtime subscription
  useRealtimeSubscription({
    table: 'project_attachments',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      fetchFiles();
    }
  });

  return {
    files,
    isLoading,
    error,
    refetch: fetchFiles
  };
}
