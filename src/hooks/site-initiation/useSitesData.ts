
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '../useRealtimeSubscription';
import { SiteData } from './types';
import { useSiteOperations } from './useSiteOperations';
import { useSiteCsvImport } from './useSiteCsvImport';
import { isEligibleForStarterPack } from './siteUtils';

export const useSitesData = (projectId?: string, pageSize = 10, page = 1) => {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  
  const { addSite, updateSite, deleteSite } = useSiteOperations(projectId, user?.id);
  const { processCSVData, processing } = useSiteCsvImport(projectId, user?.id);

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Fetch sites data
  const fetchSites = async () => {
    if (!projectId) {
      setSites([]);
      setLoading(false);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);

      // First get the total count
      const { count, error: countError } = await supabase
        .from('project_csam_site')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Then fetch the paginated data
      const { data, error } = await supabase
        .from('project_csam_site')
        .select('*')
        .eq('project_id', projectId)
        .order('pxl_site_reference_number', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching site initiation data:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSites();
  }, [projectId, pageSize, page]);

  // Set up real-time subscription
  useRealtimeSubscription({
    table: 'project_csam_site',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      fetchSites();
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
    totalCount,
    addSite,
    updateSite,
    deleteSite,
    processCSVData,
    refetch: fetchSites,
    getLABPSites,
    isEligibleForStarterPack,
    processing
  };
};
