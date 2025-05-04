
import { useSitesData, isEligibleForStarterPack, SiteData } from './site-initiation';

// Re-export the isEligibleForStarterPack function to maintain backward compatibility
export { isEligibleForStarterPack, type SiteData };

// This hook maintains the original API for backward compatibility
export const useSiteInitiationData = (projectId?: string, pageSize?: number, page?: number) => {
  return useSitesData(projectId, pageSize, page);
};
