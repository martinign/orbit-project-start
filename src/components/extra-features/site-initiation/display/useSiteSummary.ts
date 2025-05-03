
import { useMemo } from 'react';
import { SiteData, isEligibleForStarterPack } from '@/hooks/site-initiation';

export interface SiteSummary {
  totalSites: number;
  countries: string[];
  institutions: string[];
  personnel: number;
  starterPackSent: number;
  labpSites: number;
}

export function useSiteSummary(sites: SiteData[]): SiteSummary {
  return useMemo(() => {
    if (!sites.length) return {
      totalSites: 0,
      countries: [],
      institutions: [],
      personnel: 0,
      starterPackSent: 0,
      labpSites: 0
    };
    
    // Count unique sites by reference number
    const uniqueSites = new Set(sites.map(s => s.pxl_site_reference_number));
    
    // Count unique countries
    const countries = new Set(sites.filter(s => s.country).map(s => s.country));
    
    // Count unique institutions
    const institutions = new Set(sites.filter(s => s.institution).map(s => s.institution));
    
    // LABP sites count (eligible for starter packs)
    const labpSites = sites.filter(s => isEligibleForStarterPack(s)).length;
    
    // Count starter packs sent (only valid for LABP roles)
    const starterPackSent = sites.filter(s => isEligibleForStarterPack(s) && s.starter_pack).length;
    
    return {
      totalSites: uniqueSites.size,
      countries: Array.from(countries),
      institutions: Array.from(institutions),
      personnel: sites.length,
      starterPackSent,
      labpSites
    };
  }, [sites]);
}
