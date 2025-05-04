
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '../useRealtimeSubscription';
import { SiteData } from './types';
import { isEligibleForStarterPack } from './siteUtils';

/**
 * Hook to fetch all site data for overview pages (non-paginated)
 * Used specifically for components that need to display summaries of all sites
 */
export const useAllSitesData = (projectId?: string, maxLimit = 500) => {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch all sites data with a high limit but no pagination
  const fetchAllSites = async () => {
    if (!projectId) {
      setSites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('project_csam_site')
        .select('*')
        .eq('project_id', projectId)
        .order('pxl_site_reference_number', { ascending: true })
        .limit(maxLimit); // Using a high limit instead of pagination

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching all site data:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllSites();
  }, [projectId]);

  // Set up real-time subscription
  useRealtimeSubscription({
    table: 'project_csam_site',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      fetchAllSites();
    }
  });

  // Get all LABP sites
  const getLABPSites = () => {
    return sites.filter(site => site.role === 'LABP');
  };

  return {
    sites,
    loading,
    error,
    refetch: fetchAllSites,
    getLABPSites,
    isEligibleForStarterPack
  };
};
