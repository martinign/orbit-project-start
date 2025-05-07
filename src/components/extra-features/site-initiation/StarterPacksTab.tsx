
import React, { useEffect, useState } from 'react';
import { ErrorState } from './display/ErrorState';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { MainContent } from './starter-packs/MainContent';
import { useSiteReferences } from './starter-packs/hooks/useSiteReferences';
import { useStarterPackToggle } from './starter-packs/hooks/useStarterPackToggle';
import { useStarterPackStats } from './starter-packs/hooks/useStarterPackStats';
import { useLabpExport } from './starter-packs/hooks/useLabpExport';

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

  // CSV export functionality
  const { exportLabpSitesToCsv, exporting } = useLabpExport(sites, projectId);
  
  // Update pagination when filtered data changes
  useEffect(() => {
    pagination.setTotalItems(filteredSiteReferences.length);
  }, [filteredSiteReferences, pagination]);
  
  // Calculate paginated data or show all data based on showAll state
  const displaySiteReferences = React.useMemo(() => {
    if (showAll) {
      return filteredSiteReferences;
    }
    return filteredSiteReferences.slice(
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

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <MainContent
      loading={loading}
      stats={stats}
      displaySiteReferences={displaySiteReferences}
      filteredSiteReferences={filteredSiteReferences}
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
    />
  );
};
