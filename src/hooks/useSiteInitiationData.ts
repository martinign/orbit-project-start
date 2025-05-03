import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';

export interface SiteData {
  id?: string;
  country?: string;
  pxl_site_reference_number: string;
  pi_name?: string;
  site_personnel_name: string;
  role: string;
  site_personnel_email_address?: string;
  site_personnel_telephone?: string;
  site_personnel_fax?: string;
  institution?: string;
  address?: string;
  city_town?: string;
  province_state?: string;
  zip_code?: string;
  starter_pack?: boolean;
  project_id: string;
}

// Helper function to check if a site is eligible for starter pack (LABP roles only)
export const isEligibleForStarterPack = (site: SiteData): boolean => {
  return site.role === 'LABP';
};

export const useSiteInitiationData = (projectId?: string) => {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

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

  // Add a single site
  const addSite = async (siteData: SiteData) => {
    if (!user || !projectId) return null;

    try {
      // Ensure starter pack is false for non-LABP roles
      const updatedSiteData = {
        ...siteData,
        starter_pack: siteData.role === 'LABP' ? siteData.starter_pack : false
      };

      const { data, error } = await supabase
        .from('project_csam_site')
        .insert([{ ...updatedSiteData, user_id: user.id, project_id: projectId }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Site added successfully",
        description: "New site has been added to the project.",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding site:', error);
      toast({
        title: "Failed to add site",
        description: (error as Error).message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Update a single site
  const updateSite = async (id: string, updates: Partial<SiteData>) => {
    if (!user || !projectId) return false;

    try {
      // Get current site data to check role
      const { data: currentSite } = await supabase
        .from('project_csam_site')
        .select('role')
        .eq('id', id)
        .single();

      // Ensure starter pack is false for non-LABP roles
      const updatedData = { ...updates };
      
      // If role is being changed, check if we need to reset starter pack
      if (updates.role && updates.role !== 'LABP') {
        updatedData.starter_pack = false;
      } 
      // If site was not LABP and starter_pack is being set, check role
      else if (updates.starter_pack && currentSite && currentSite.role !== 'LABP') {
        updatedData.starter_pack = false;
      }

      const { error } = await supabase
        .from('project_csam_site')
        .update(updatedData)
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;
      
      toast({
        title: "Site updated successfully",
        description: "Site information has been updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating site:', error);
      toast({
        title: "Failed to update site",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a single site
  const deleteSite = async (id: string) => {
    if (!user || !projectId) return false;

    try {
      const { error } = await supabase
        .from('project_csam_site')
        .delete()
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;
      
      toast({
        title: "Site deleted successfully",
        description: "Site has been removed from the project.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting site:', error);
      toast({
        title: "Failed to delete site",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Process CSV data with upsert logic
  const processCSVData = async (records: SiteData[]) => {
    if (!user || !projectId || !records.length) return { success: 0, error: 0 };

    // Update records to ensure starter_pack is false for non-LABP roles
    const processedRecords = records.map(record => ({
      ...record,
      starter_pack: record.role === 'LABP' ? Boolean(record.starter_pack) : false
    }));

    let successCount = 0;
    let errorCount = 0;

    try {
      // Process records in batches to avoid overwhelming the database
      const batchSize = 50;
      const batchCount = Math.ceil(processedRecords.length / batchSize);

      for (let i = 0; i < batchCount; i++) {
        const batchStart = i * batchSize;
        const batchEnd = Math.min((i + 1) * batchSize, processedRecords.length);
        const batch = processedRecords.slice(batchStart, batchEnd);

        // Prepare batch with user_id and project_id
        const batchWithIds = batch.map(record => ({
          ...record,
          user_id: user.id,
          project_id: projectId
        }));

        // Use upsert operation - now with proper conflict detection
        const { data, error } = await supabase
          .from('project_csam_site')
          .upsert(batchWithIds, {
            onConflict: 'pxl_site_reference_number,site_personnel_name,role,project_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          console.error('Batch error:', error);
          errorCount += batch.length;
        } else {
          successCount += (data?.length || 0);
          errorCount += batch.length - (data?.length || 0);
        }
      }

      toast({
        title: "CSV Import Completed",
        description: `Successfully processed ${successCount} records. ${errorCount > 0 ? `Failed to process ${errorCount} records.` : ''}`,
        variant: errorCount > 0 ? "default" : "default",
      });

      // Refresh the data
      await fetchSites();

      return { success: successCount, error: errorCount };
    } catch (error) {
      console.error('Error processing CSV data:', error);
      toast({
        title: "CSV Import Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      return { success: successCount, error: errorCount };
    }
  };

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
    isEligibleForStarterPack
  };
};
