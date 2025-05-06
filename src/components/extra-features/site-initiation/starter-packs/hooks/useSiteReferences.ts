
import { useState, useMemo, useEffect } from 'react';
import { SiteData } from '@/hooks/site-initiation/types';
import { 
  getUniqueSiteReferences, 
  isMissingLabpRole, 
  getMissingRoles 
} from '@/hooks/site-initiation/siteUtils';
import { StarterPackSiteReference } from '../types';

export const useSiteReferences = (
  sites: SiteData[], 
  optimisticUpdates: Record<string, any>
) => {
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  // Get all unique site references
  const uniqueSiteReferences = useMemo(() => {
    return getUniqueSiteReferences(sites);
  }, [sites]);

  // Group sites by reference number
  const sitesByReference = useMemo(() => {
    const groupedSites: Record<string, SiteData[]> = {};
    
    uniqueSiteReferences.forEach(reference => {
      groupedSites[reference] = sites.filter(site => 
        site.pxl_site_reference_number === reference
      );
    });
    
    return groupedSites;
  }, [sites, uniqueSiteReferences]);
  
  // Get all unique countries from sites
  const uniqueCountries = useMemo(() => {
    const countries = new Set(sites
      .filter(site => site.country)
      .map(site => site.country as string));
    return Array.from(countries).sort();
  }, [sites]);

  // For each site reference, find if it has a LABP role site and if that site has a starter pack
  const siteReferenceData = useMemo((): StarterPackSiteReference[] => {
    return uniqueSiteReferences.map(reference => {
      const sitesForReference = sitesByReference[reference];
      const missingLabp = isMissingLabpRole(sites, reference);
      const labpSite = sitesForReference.find(site => site.role === 'LABP');
      const missingRoles = getMissingRoles(sites, reference);
      
      // Apply optimistic updates if they exist for this site
      const hasOptimisticUpdate = labpSite && labpSite.id && optimisticUpdates[labpSite.id] !== undefined;
      
      // Handle different types of optimistic updates
      let starterPackStatus = labpSite ? !!labpSite.starter_pack : false;
      let registeredInSrpStatus = labpSite ? !!labpSite.registered_in_srp : false;
      let suppliesAppliedStatus = labpSite ? !!labpSite.supplies_applied : false;
      
      if (hasOptimisticUpdate) {
        const updates = optimisticUpdates[labpSite!.id!];
        if (updates.hasOwnProperty('starter_pack')) {
          starterPackStatus = updates.starter_pack;
        }
        if (updates.hasOwnProperty('registered_in_srp')) {
          registeredInSrpStatus = updates.registered_in_srp;
        }
        if (updates.hasOwnProperty('supplies_applied')) {
          suppliesAppliedStatus = updates.supplies_applied;
        }
      }
      
      // Find a representative site for display (prefer LABP if available)
      const representativeSite = labpSite || sitesForReference[0];
      
      return {
        reference,
        missingLabp,
        labpSite,
        hasStarterPack: starterPackStatus,
        registeredInSrp: registeredInSrpStatus,
        suppliesApplied: suppliesAppliedStatus,
        starterPackUpdatedAt: labpSite?.updated_at,
        country: representativeSite.country || '',
        institution: representativeSite.institution || '',
        personnel: representativeSite.site_personnel_name || '',
        allSitesForReference: sitesForReference,
        missingRoles: missingRoles
      };
    });
  }, [uniqueSiteReferences, sitesByReference, sites, optimisticUpdates]);

  // Apply country filter to site references
  const filteredSiteReferences = useMemo(() => {
    if (countryFilter === "all") {
      return siteReferenceData;
    }
    return siteReferenceData.filter(site => site.country === countryFilter);
  }, [siteReferenceData, countryFilter]);

  return {
    uniqueSiteReferences,
    uniqueCountries,
    siteReferenceData,
    filteredSiteReferences,
    countryFilter,
    setCountryFilter,
    showAll,
    setShowAll
  };
};
