
import { useSitesData, isEligibleForStarterPack, SiteData } from './site-initiation';
import { CRAData, CRAOperationsResult } from './cra-list/types';
import { useCraCsvImport } from './cra-list/useCraCsvImport';

// Re-export the isEligibleForStarterPack function to maintain backward compatibility
export { isEligibleForStarterPack, type SiteData };

// This hook maintains the original API for backward compatibility
export const useSiteInitiationData = (projectId?: string, pageSize?: number, page?: number) => {
  const { processCRACSVData } = useCraCsvImport(projectId);
  
  return {
    ...useSitesData(projectId, pageSize, page),
    processCRACSVData
  };
};
