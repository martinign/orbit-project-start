
import React, { useEffect, useState } from 'react';
import { ErrorState } from './display/ErrorState';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { MainContent } from './starter-packs/MainContent';
import { useSiteReferences } from './starter-packs/hooks/useSiteReferences';
import { useStarterPackToggle } from './starter-packs/hooks/useStarterPackToggle';
import { useStarterPackStats } from './starter-packs/hooks/useStarterPackStats';
import { useLabpExport } from './starter-packs/hooks/useLabpExport';
import { SiteStatusHistoryDialog } from './starter-packs/SiteStatusHistoryDialog';

interface StarterPacksTabProps {
  projectId?: string;
}

export const StarterPacksTab: React.FC<StarterPacksTabProps> = ({ projectId }) => {
  const { 
    allSites: sites, // Use allSites to get the full dataset for calculations
    loading, 
    error,
    refetch,
    pagination
  } = useAllSitesData(projectId, 10); // Set page size to 10

  // General search query for quick filtering
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // State for tracking selected site references
  const [selectedSiteRefs, setSelectedSiteRefs] = useState<string[]>([]);

  // State for status history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<{
    id?: string;
    siteRef: string;
    siteName: string;
  } | null>(null);

  const { 
    optimisticUpdates, 
    handleStarterPackToggle,
    handleRegisteredInSrpToggle,
    handleSuppliesAppliedToggle,
    resetOptimisticUpdates
  } = useStarterPackToggle(refetch);
  
  const {
    uniqueCountries,
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
    resetFilters,
    siteReferenceData
  } = useSiteReferences(sites, optimisticUpdates);

  // Calculate statistics
  const stats = useStarterPackStats(siteReferenceData);
  
  // Prepare stats in the format expected by MainContent
  const contentStats = {
    totalSites: stats.total,
    labpSites: siteReferenceData.length, // All site references that could have a LABP site
    starterPackSent: stats.sent,
    starterPackNeeded: stats.total - stats.sent,
    registeredInSrp: siteReferenceData.filter(site => site.registeredInSrp).length,
    suppliesApplied: siteReferenceData.filter(site => site.suppliesApplied).length
  };

  // Convert site references to format expected by MainContent
  const mappedSiteReferences = siteReferenceData.map(site => ({
    siteRef: site.reference,
    sites: site.allSitesForReference,
    hasSiteData: true
  }));

  // CSV export functionality
  const { exportLabpSitesToCsv, exporting } = useLabpExport(sites, projectId);
  
  // Update pagination when filtered data changes
  useEffect(() => {
    pagination.setTotalItems(filteredSiteReferences.length);
  }, [filteredSiteReferences, pagination]);
  
  // Calculate paginated data or show all data based on showAll state
  const displaySiteReferences = React.useMemo(() => {
    const filteredMappedReferences = filteredSiteReferences.map(site => ({
      siteRef: site.reference,
      sites: site.allSitesForReference,
      hasSiteData: true
    }));
    
    if (showAll) {
      return filteredMappedReferences;
    }
    
    return filteredMappedReferences.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    );
  }, [filteredSiteReferences, pagination.currentPage, pagination.pageSize, showAll]);
  
  // Clear optimistic updates when sites data is refreshed
  useEffect(() => {
    resetOptimisticUpdates();
  }, [sites]);

  // Reset selected sites when filtered data changes
  useEffect(() => {
    setSelectedSiteRefs([]);
  }, [filteredSiteReferences]);

  // Export handler
  const handleExportCSV = () => {
    exportLabpSitesToCsv(selectedSiteRefs);
  };

  // View history handler
  const handleViewHistory = (siteRef: string, siteName: string, siteId?: string) => {
    setSelectedSite({ siteRef, siteName, id: siteId });
    setHistoryDialogOpen(true);
  };

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <MainContent
        loading={loading}
        stats={contentStats}
        displaySiteReferences={displaySiteReferences}
        filteredSiteReferences={filteredSiteReferences.map(site => ({
          siteRef: site.reference,
          sites: site.allSitesForReference,
          hasSiteData: true
        }))}
        starterPackFilter={starterPackFilter}
        setStarterPackFilter={setStarterPackFilter}
        registeredInSrpFilter={registeredInSrpFilter}
        setRegisteredInSrpFilter={setRegisteredInSrpFilter}
        suppliesAppliedFilter={suppliesAppliedFilter}
        setSuppliesAppliedFilter={setSuppliesAppliedFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilterCount={activeFilterCount}
        resetFilters={resetFilters}
        handleExportCSV={handleExportCSV}
        selectedSiteRefs={selectedSiteRefs}
        setSelectedSiteRefs={setSelectedSiteRefs}
        handleStarterPackToggle={handleStarterPackToggle}
        handleRegisteredInSrpToggle={handleRegisteredInSrpToggle}
        handleSuppliesAppliedToggle={handleSuppliesAppliedToggle}
        showAll={showAll}
        setShowAll={setShowAll}
        pagination={pagination}
        exporting={exporting}
        onViewHistory={handleViewHistory}
      />
      
      {selectedSite && (
        <SiteStatusHistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          projectId={projectId}
          siteId={selectedSite.id}
          siteRef={selectedSite.siteRef}
          siteName={selectedSite.siteName}
        />
      )}
    </>
  );
};
