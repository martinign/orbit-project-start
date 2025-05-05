
import { useSitesData, isEligibleForStarterPack, SiteData } from './site-initiation';
import { processCRACSVData } from './site-initiation/useCraCsvImport';
import { CRAData, CRAOperationsResult } from './cra-list/types';

// Re-export the isEligibleForStarterPack function to maintain backward compatibility
export { isEligibleForStarterPack, type SiteData, type CRAData, type CRAOperationsResult };

// This hook maintains the original API for backward compatibility
export const useSiteInitiationData = (projectId?: string, pageSize?: number, page?: number) => {
  const siteData = useSitesData(projectId, pageSize, page);
  
  return {
    ...siteData,
    processCRACSVData
  };
};
