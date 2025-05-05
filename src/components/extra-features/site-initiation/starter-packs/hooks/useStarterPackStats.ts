
import { useMemo } from 'react';
import { StarterPackSiteReference, StarterPacksStats } from '../types';

export const useStarterPackStats = (siteReferenceData: StarterPackSiteReference[]): StarterPacksStats => {
  // Calculate statistics (for all unique site references)
  return useMemo(() => {
    // Total is all unique site references
    const totalSites = siteReferenceData.length;
    
    // Count how many site references have a LABP site with a starter pack
    const sentCount = siteReferenceData.filter(site => site.hasStarterPack).length;
    
    // Calculate percentage
    const percentage = totalSites > 0 ? (sentCount / totalSites) * 100 : 0;
    
    return {
      total: totalSites,
      sent: sentCount,
      percentage: Math.round(percentage)
    };
  }, [siteReferenceData]);
};
