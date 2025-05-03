
import { SiteData } from './types';

// Required role types for each site reference
export const REQUIRED_ROLES = ['PINV', 'STCO', 'PHAR', 'DRGR', 'MATR', 'LABP', 'PDRGR'];

// Helper function to check if a site is eligible for starter pack (LABP roles only)
export const isEligibleForStarterPack = (site: SiteData): boolean => {
  return site.role === 'LABP';
};

// Get all sites with the same reference number
export const getSitesWithSameReference = (sites: SiteData[], referenceNumber: string): SiteData[] => {
  return sites.filter(site => site.pxl_site_reference_number === referenceNumber);
};

// Get all unique site reference numbers
export const getUniqueSiteReferences = (sites: SiteData[]): string[] => {
  return [...new Set(sites.map(site => site.pxl_site_reference_number))];
};

// Get missing roles for a specific site reference
export const getMissingRoles = (sites: SiteData[], referenceNumber: string): string[] => {
  const sitesWithSameRef = getSitesWithSameReference(sites, referenceNumber);
  const existingRoles = sitesWithSameRef.map(site => site.role);
  return REQUIRED_ROLES.filter(role => !existingRoles.includes(role));
};

// Check if a site reference is missing the LABP role specifically
export const isMissingLabpRole = (sites: SiteData[], referenceNumber: string): boolean => {
  const sitesWithSameRef = getSitesWithSameReference(sites, referenceNumber);
  return !sitesWithSameRef.some(site => site.role === 'LABP');
};

// Get a map of site references to their missing roles
export const getSitesWithMissingRoles = (sites: SiteData[]): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  const uniqueReferences = getUniqueSiteReferences(sites);
  
  uniqueReferences.forEach(ref => {
    const missingRoles = getMissingRoles(sites, ref);
    if (missingRoles.length > 0) {
      result[ref] = missingRoles;
    }
  });
  
  return result;
};

// Get site references missing the LABP role specifically
export const getSitesMissingLabpRole = (sites: SiteData[]): string[] => {
  const uniqueReferences = getUniqueSiteReferences(sites);
  return uniqueReferences.filter(ref => isMissingLabpRole(sites, ref));
};
