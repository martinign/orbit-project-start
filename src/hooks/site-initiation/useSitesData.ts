
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '../useRealtimeSubscription';
import { SiteData } from './types';
import { useSiteOperations } from './useSiteOperations';
import { useSiteCsvImport } from './useSiteCsvImport';
import { isEligibleForStarterPack } from './siteUtils';

export const useSitesData = (projectId?: string) => {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  const { addSite, updateSite, deleteSite } = useSiteOperations(projectId, user?.id);
  const { processCSVData, processing } = useSiteCsvImport(projectId, user?.id);

  // Fetch sites data
  const fetchSites = async () => {
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
        .order('pxl_site_reference_number', { ascending: true });

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
  }, [projectId]);

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
