
import React from 'react';
import { LoadingSiteState } from '../table/LoadingSiteState';
import { SummaryCard } from './SummaryCard';
import { StarterPackFiltersPopover } from './StarterPackFiltersPopover';
import { TableHeader } from './TableHeader';
import { SiteTable } from './SiteTable';
import { TableFooter } from './TableFooter';
import { SiteData } from '@/hooks/site-initiation/types';
import { PaginationState } from '@/hooks/usePagination';

interface MainContentProps {
  loading: boolean;
  stats: {
    totalSites: number;
    labpSites: number;
    starterPackSent: number;
    starterPackNeeded: number;
    registeredInSrp: number;
    suppliesApplied: number;
  };
  displaySiteReferences: {
    siteRef: string;
    sites: SiteData[];
    hasSiteData: boolean;
  }[];
  filteredSiteReferences: {
    siteRef: string;
    sites: SiteData[];
    hasSiteData: boolean;
  }[];
  starterPackFilter: string;
  setStarterPackFilter: (filter: string) => void;
  registeredInSrpFilter: string;
  setRegisteredInSrpFilter: (filter: string) => void;
  suppliesAppliedFilter: string;
  setSuppliesAppliedFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilterCount: number;
  resetFilters: () => void;
  handleExportCSV: () => void;
  selectedSiteRefs: string[];
  setSelectedSiteRefs: (refs: string[]) => void;
  handleStarterPackToggle: (site: SiteData | undefined, newValue: boolean) => Promise<void>;
  handleRegisteredInSrpToggle: (site: SiteData | undefined, newValue: boolean) => Promise<void>;
  handleSuppliesAppliedToggle: (site: SiteData | undefined, newValue: boolean) => Promise<void>;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  pagination: PaginationState;
  exporting: boolean;
  onViewHistory: (siteRef: string, siteName: string, siteId?: string) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  loading,
  stats,
  displaySiteReferences,
  filteredSiteReferences,
  starterPackFilter,
  setStarterPackFilter,
  registeredInSrpFilter,
  setRegisteredInSrpFilter,
  suppliesAppliedFilter,
  setSuppliesAppliedFilter,
  searchQuery,
  setSearchQuery,
  activeFilterCount,
  resetFilters,
  handleExportCSV,
  selectedSiteRefs,
  setSelectedSiteRefs,
  handleStarterPackToggle,
  handleRegisteredInSrpToggle,
  handleSuppliesAppliedToggle,
  showAll,
  setShowAll,
  pagination,
  exporting,
  onViewHistory
}) => {
  if (loading) {
    return <LoadingSiteState />;
  }
  
  return (
    <div className="space-y-6">
      <SummaryCard stats={stats} />
      
      <div className="bg-white border rounded-md shadow-sm">
        <TableHeader
          filtersOpen={false} 
          setFiltersOpen={() => {}}
          activeFilterCount={activeFilterCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          hasActiveFilters={activeFilterCount > 0}
          onExportCSV={handleExportCSV}
          exporting={exporting}
          selectedCount={selectedSiteRefs.length}
          totalCount={filteredSiteReferences.length}
          FiltersPopover={
            <StarterPackFiltersPopover
              starterPackFilter={starterPackFilter}
              setStarterPackFilter={setStarterPackFilter}
              registeredInSrpFilter={registeredInSrpFilter}
              setRegisteredInSrpFilter={setRegisteredInSrpFilter}
              suppliesAppliedFilter={suppliesAppliedFilter}
              setSuppliesAppliedFilter={setSuppliesAppliedFilter}
              onResetFilters={resetFilters}
            />
          }
        />
        
        <SiteTable 
          siteReferences={displaySiteReferences}
          selectedSiteRefs={selectedSiteRefs}
          setSelectedSiteRefs={setSelectedSiteRefs}
          onStarterPackToggle={handleStarterPackToggle}
          onRegisteredInSrpToggle={handleRegisteredInSrpToggle}
          onSuppliesAppliedToggle={handleSuppliesAppliedToggle}
          onViewHistory={onViewHistory}
        />
        
        <TableFooter 
          filteredCount={filteredSiteReferences.length}
          pagination={pagination}
          showAll={showAll}
          setShowAll={setShowAll}
        />
      </div>
    </div>
  );
};
