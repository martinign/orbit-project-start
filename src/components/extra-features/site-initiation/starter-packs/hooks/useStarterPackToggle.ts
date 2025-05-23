
import { useState } from 'react';
import { SiteData } from '@/hooks/site-initiation/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useStarterPackToggle = (refetch: () => void) => {
  // State to track optimistic UI updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, any>>({});
  
  // Update site function
  const updateSite = async (siteId: string, updates: Partial<SiteData>) => {
    try {
      const { error } = await supabase
        .from('project_csam_site')
        .update(updates)
        .eq('id', siteId);
      
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error updating site:', error);
      return false;
    }
  };

  // Handle starter pack toggle with optimistic UI update - only for LABP sites
  const handleStarterPackToggle = async (labpSite: SiteData | undefined, newValue: boolean) => {
    if (labpSite && labpSite.id) {
      // Apply optimistic update
      setOptimisticUpdates(prev => ({
        ...prev,
        [labpSite.id!]: { ...prev[labpSite.id!], starter_pack: newValue }
      }));
      
      // Show optimistic toast
      toast({
        title: newValue ? "Marking starter pack as sent..." : "Marking starter pack as not sent...",
        description: `Updating status for ${labpSite.pxl_site_reference_number}`,
      });
      
      // Make the actual update
      const success = await updateSite(labpSite.id, { 
        starter_pack: newValue,
        updated_at: new Date().toISOString() // Update the timestamp
      });
      
      if (success) {
        toast({
          title: newValue ? "Starter pack marked as sent" : "Starter pack marked as not sent",
          description: `Updated status for ${labpSite.pxl_site_reference_number}`,
        });
        
        // No need to call refetch() as the real-time subscription will handle the update
      } else {
        // Revert optimistic update on failure
        setOptimisticUpdates(prev => {
          const newUpdates = { ...prev };
          if (newUpdates[labpSite.id!]) {
            delete newUpdates[labpSite.id!].starter_pack;
            if (Object.keys(newUpdates[labpSite.id!]).length === 0) {
              delete newUpdates[labpSite.id!];
            }
          }
          return newUpdates;
        });
        
        toast({
          title: "Failed to update starter pack status",
          description: "Please try again",
          variant: "destructive"
        });
      }
    }
  };

  // Handle registered in SRP toggle with optimistic UI update - for any site
  const handleRegisteredInSrpToggle = async (site: SiteData | undefined, newValue: boolean) => {
    if (site && site.id) {
      // Apply optimistic update
      setOptimisticUpdates(prev => ({
        ...prev,
        [site.id!]: { ...prev[site.id!], registered_in_srp: newValue }
      }));
      
      // Show optimistic toast
      toast({
        title: newValue ? "Marking site as registered in SRP..." : "Marking site as not registered in SRP...",
        description: `Updating status for ${site.pxl_site_reference_number}`,
      });
      
      // Make the actual update
      const success = await updateSite(site.id, { 
        registered_in_srp: newValue,
        updated_at: new Date().toISOString()
      });
      
      if (success) {
        toast({
          title: newValue ? "Site marked as registered in SRP" : "Site marked as not registered in SRP",
          description: `Updated status for ${site.pxl_site_reference_number}`,
        });
      } else {
        // Revert optimistic update on failure
        setOptimisticUpdates(prev => {
          const newUpdates = { ...prev };
          if (newUpdates[site.id!]) {
            delete newUpdates[site.id!].registered_in_srp;
            if (Object.keys(newUpdates[site.id!]).length === 0) {
              delete newUpdates[site.id!];
            }
          }
          return newUpdates;
        });
        
        toast({
          title: "Failed to update SRP registration status",
          description: "Please try again",
          variant: "destructive"
        });
      }
    }
  };

  // Handle supplies applied toggle with optimistic UI update - for any site
  const handleSuppliesAppliedToggle = async (site: SiteData | undefined, newValue: boolean) => {
    if (site && site.id) {
      // Apply optimistic update
      setOptimisticUpdates(prev => ({
        ...prev,
        [site.id!]: { ...prev[site.id!], supplies_applied: newValue }
      }));
      
      // Show optimistic toast
      toast({
        title: newValue ? "Marking supplies as applied..." : "Marking supplies as not applied...",
        description: `Updating status for ${site.pxl_site_reference_number}`,
      });
      
      // Make the actual update
      const success = await updateSite(site.id, { 
        supplies_applied: newValue,
        updated_at: new Date().toISOString()
      });
      
      if (success) {
        toast({
          title: newValue ? "Supplies marked as applied" : "Supplies marked as not applied",
          description: `Updated status for ${site.pxl_site_reference_number}`,
        });
      } else {
        // Revert optimistic update on failure
        setOptimisticUpdates(prev => {
          const newUpdates = { ...prev };
          if (newUpdates[site.id!]) {
            delete newUpdates[site.id!].supplies_applied;
            if (Object.keys(newUpdates[site.id!]).length === 0) {
              delete newUpdates[site.id!];
            }
          }
          return newUpdates;
        });
        
        toast({
          title: "Failed to update supplies status",
          description: "Please try again",
          variant: "destructive"
        });
      }
    }
  };

  // Reset optimistic updates
  const resetOptimisticUpdates = () => {
    setOptimisticUpdates({});
  };

  return {
    optimisticUpdates,
    handleStarterPackToggle,
    handleRegisteredInSrpToggle,
    handleSuppliesAppliedToggle,
    resetOptimisticUpdates
  };
};
