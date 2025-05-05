
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from './display/ErrorState';
import { LoadingState } from './display/LoadingState';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';

// Import refactored components
import { SummaryCard } from './starter-packs/SummaryCard';
import { TableHeader } from './starter-packs/TableHeader';
import { SiteTable } from './starter-packs/SiteTable';
import { TableFooter } from './starter-packs/TableFooter';
import { useSiteReferences } from './starter-packs/hooks/useSiteReferences';
import { useStarterPackToggle } from './starter-packs/hooks/useStarterPackToggle';
import { useStarterPackStats } from './starter-packs/hooks/useStarterPackStats';

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

  const { 
    optimisticUpdates, 
    handleStarterPackToggle,
    resetOptimisticUpdates
  } = useStarterPackToggle(refetch);
  
  const {
    uniqueCountries,
    siteReferenceData,
    filteredSiteReferences,
    countryFilter,
    setCountryFilter,
    showAll,
    setShowAll
  } = useSiteReferences(sites, optimisticUpdates);

  // Calculate statistics
  const stats = useStarterPackStats(siteReferenceData);

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

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <SummaryCard stats={stats} />

      {/* Sites Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <TableHeader 
            countryFilter={countryFilter} 
            setCountryFilter={setCountryFilter} 
            uniqueCountries={uniqueCountries} 
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : filteredSiteReferences.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No sites found for this country</h3>
              <p className="text-muted-foreground text-sm">
                Try selecting a different country filter or add more sites
              </p>
            </div>
          ) : (
            <>
              <SiteTable 
                displaySiteReferences={displaySiteReferences} 
                handleStarterPackToggle={handleStarterPackToggle}
              />
              
              {/* Pagination Controls with Show All button */}
              {filteredSiteReferences.length > 0 && (
                <TableFooter 
                  showAll={showAll} 
                  setShowAll={setShowAll}
                  pagination={pagination}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
