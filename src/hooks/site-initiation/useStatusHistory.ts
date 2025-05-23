
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteStatusHistoryRecord } from './types';

export const useStatusHistory = (projectId?: string, siteId?: string, siteRef?: string) => {
  const [history, setHistory] = useState<SiteStatusHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch history data based on provided filters
  const fetchHistory = async () => {
    if (!projectId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let query = supabase
        .from('project_csam_site_status_history')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      // Apply additional filters if provided
      if (siteId) {
        query = query.eq('site_id', siteId);
      }
      
      if (siteRef) {
        query = query.eq('pxl_site_reference_number', siteRef);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching status history:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch on component mount or when filters change
  useEffect(() => {
    fetchHistory();
  }, [projectId, siteId, siteRef]);
  
  return {
    history,
    loading,
    error,
    refetch: fetchHistory
  };
};
