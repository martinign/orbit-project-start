
import { useMemo } from 'react';
import { SiteData, isEligibleForStarterPack, getSitesWithMissingRoles, getSitesMissingLabpRole, getUniqueSiteReferences } from '@/hooks/site-initiation';

export interface SiteSummary {
  totalSites: number;
  countries: string[];
  institutions: string[];
  personnel: number;
  starterPackSent: number;
  labpSites: number;
  sitesMissingLabpRole: string[];
  sitesWithMissingRoles: Record<string, string[]>;
}

export function useSiteSummary(sites: SiteData[]): SiteSummary {
  return useMemo(() => {
    if (!sites.length) return {
      totalSites: 0,
      countries: [],
      institutions: [],
      personnel: 0,
      starterPackSent: 0,
      labpSites: 0,
      sitesMissingLabpRole: [],
      sitesWithMissingRoles: {}
    };
    
    // Count unique sites by reference number
    const uniqueReferences = getUniqueSiteReferences(sites);
    
    // Count unique countries
    const countries = new Set(sites.filter(s => s.country).map(s => s.country));
    
    // Count unique institutions
    const institutions = new Set(sites.filter(s => s.institution).map(s => s.institution));
    
    // LABP sites count (eligible for starter packs)
    const labpSites = sites.filter(s => isEligibleForStarterPack(s)).length;
    
    // Count starter packs sent (only valid for LABP roles)
    const starterPackSent = sites.filter(s => isEligibleForStarterPack(s) && s.starter_pack).length;
    
    // Get sites missing LABP role
    const sitesMissingLabpRole = getSitesMissingLabpRole(sites);
    
    // Get all sites with missing roles
    const sitesWithMissingRoles = getSitesWithMissingRoles(sites);
    
    return {
      totalSites: uniqueReferences.length,
      countries: Array.from(countries),
      institutions: Array.from(institutions),
      personnel: sites.length,
      starterPackSent,
      labpSites,
      sitesMissingLabpRole,
      sitesWithMissingRoles
    };
  }, [sites]);
}
