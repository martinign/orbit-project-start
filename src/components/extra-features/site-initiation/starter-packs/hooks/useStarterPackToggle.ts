
import { useState } from 'react';
import { SiteData } from '@/hooks/site-initiation/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useStarterPackToggle = (refetch: () => void) => {
  // State to track optimistic UI updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({});
  
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

  // Handle starter pack toggle with optimistic UI update
  const handleStarterPackToggle = async (labpSite: SiteData | undefined, newValue: boolean) => {
    if (labpSite && labpSite.id) {
      // Apply optimistic update
      setOptimisticUpdates(prev => ({
        ...prev,
        [labpSite.id!]: newValue
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
          delete newUpdates[labpSite.id!];
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

  // Reset optimistic updates
  const resetOptimisticUpdates = () => {
    setOptimisticUpdates({});
  };

  return {
    optimisticUpdates,
    handleStarterPackToggle,
    resetOptimisticUpdates
  };
};
