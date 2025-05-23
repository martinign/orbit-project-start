
import { useState, useMemo } from 'react';
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
  // Main filters - only keeping the requested ones
  const [starterPackFilter, setStarterPackFilter] = useState<string>("all");
  const [registeredInSrpFilter, setRegisteredInSrpFilter] = useState<string>("all");
  const [suppliesAppliedFilter, setSuppliesAppliedFilter] = useState<string>("all");
  
  // Pagination state
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
      
      // Find a representative site for this reference (prefer LABP if available)
      const representativeSite = labpSite || sitesForReference[0];
      
      // Apply optimistic updates - check all relevant sites for this reference
      let starterPackStatus = labpSite ? !!labpSite.starter_pack : false;
      let registeredInSrpStatus = representativeSite ? !!representativeSite.registered_in_srp : false;
      let suppliesAppliedStatus = representativeSite ? !!representativeSite.supplies_applied : false;
      
      // Apply optimistic updates for LABP site if available (for starter pack)
      if (labpSite && labpSite.id && optimisticUpdates[labpSite.id]) {
        const updates = optimisticUpdates[labpSite.id];
        if (updates.hasOwnProperty('starter_pack')) {
          starterPackStatus = updates.starter_pack;
        }
      }
      
      // Apply optimistic updates for representative site (for SRP and supplies)
      if (representativeSite && representativeSite.id && optimisticUpdates[representativeSite.id]) {
        const updates = optimisticUpdates[representativeSite.id];
        if (updates.hasOwnProperty('registered_in_srp')) {
          registeredInSrpStatus = updates.registered_in_srp;
        }
        if (updates.hasOwnProperty('supplies_applied')) {
          suppliesAppliedStatus = updates.supplies_applied;
        }
      }
      
      // Also check if any other site in this reference has optimistic updates
      sitesForReference.forEach(site => {
        if (site.id && optimisticUpdates[site.id]) {
          const updates = optimisticUpdates[site.id];
          
          // Update registered_in_srp status if this site has an optimistic update
          if (updates.hasOwnProperty('registered_in_srp') && site === representativeSite) {
            registeredInSrpStatus = updates.registered_in_srp;
          }
          
          // Update supplies_applied status if this site has an optimistic update
          if (updates.hasOwnProperty('supplies_applied') && site === representativeSite) {
            suppliesAppliedStatus = updates.supplies_applied;
          }
        }
      });
      
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

  // Apply all filters to site references
  const filteredSiteReferences = useMemo(() => {
    return siteReferenceData.filter(site => {
      // Starter pack filter
      if (starterPackFilter === 'sent' && !site.hasStarterPack) {
        return false;
      } else if (starterPackFilter === 'not-sent' && site.hasStarterPack) {
        return false;
      } else if (starterPackFilter === 'no-labp' && !site.missingLabp) {
        return false;
      }
      
      // Registered in SRP filter
      if (registeredInSrpFilter === 'yes' && !site.registeredInSrp) {
        return false;
      } else if (registeredInSrpFilter === 'no' && site.registeredInSrp) {
        return false;
      }
      
      // Supplies applied filter
      if (suppliesAppliedFilter === 'yes' && !site.suppliesApplied) {
        return false;
      } else if (suppliesAppliedFilter === 'no' && site.suppliesApplied) {
        return false;
      }
      
      return true;
    });
  }, [siteReferenceData, starterPackFilter, registeredInSrpFilter, suppliesAppliedFilter]);

  // Get count of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (starterPackFilter !== "all") count++;
    if (registeredInSrpFilter !== "all") count++;
    if (suppliesAppliedFilter !== "all") count++;
    return count;
  }, [starterPackFilter, registeredInSrpFilter, suppliesAppliedFilter]);

  // Reset all filters
  const resetFilters = () => {
    setStarterPackFilter("all");
    setRegisteredInSrpFilter("all");
    setSuppliesAppliedFilter("all");
  };

  return {
    uniqueSiteReferences,
    uniqueCountries,
    siteReferenceData,
    filteredSiteReferences,
    starterPackFilter,
    setStarterPackFilter,
    registeredInSrpFilter,
    setRegisteredInSrpFilter,
    suppliesAppliedFilter,
    setSuppliesAppliedFilter,
    showAll,
    setShowAll,
    activeFilterCount,
    resetFilters
  };
};
