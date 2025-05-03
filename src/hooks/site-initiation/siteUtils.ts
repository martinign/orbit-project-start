
import { SiteData } from './types';

// Helper function to check if a site is eligible for starter pack (LABP roles only)
export const isEligibleForStarterPack = (site: SiteData): boolean => {
  return site.role === 'LABP';
};
