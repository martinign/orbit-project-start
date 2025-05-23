import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState } from '../display/LoadingState';
import { SummaryCard } from './SummaryCard';
import { TableHeader } from './TableHeader';
import { SiteTable } from './SiteTable';
import TableFooter from './TableFooter';
import { StarterPackSiteReference } from './types';
import { StarterPacksStats } from './types';
import { SiteData } from '@/hooks/site-initiation/types';
import { PaginationState } from '@/hooks/usePagination';

interface MainContentProps {
  loading: boolean;
  stats: StarterPacksStats;
  displaySiteReferences: StarterPackSiteReference[];
  filteredSiteReferences: StarterPackSiteReference[];
  starterPackFilter: string;
  setStarterPackFilter: (value: string) => void;
  registeredInSrpFilter: string;
  setRegisteredInSrpFilter: (value: string) => void;
  suppliesAppliedFilter: string;
  setSuppliesAppliedFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilterCount: number;
  resetFilters: () => void;
  handleExportCSV: () => void;
  selectedSiteRefs: string[];
  setSelectedSiteRefs: (refs: string[]) => void;
  handleStarterPackToggle: (site: any, value: boolean) => void;
  handleRegisteredInSrpToggle: (site: any, value: boolean) => void;
  handleSuppliesAppliedToggle: (site: any, value: boolean) => void;
  showAll: boolean; 
  setShowAll: (value: boolean) => void;
  pagination: PaginationState;
  exporting: boolean;
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
  exporting
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <SummaryCard stats={stats} />

      {/* Sites Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <TableHeader 
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
            selectedCount={selectedSiteRefs.length}
            totalCount={filteredSiteReferences.length}
            exporting={exporting}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : filteredSiteReferences.length === 0 ? (
            <EmptySitesState />
          ) : (
            <>
              <SiteTable 
                displaySiteReferences={displaySiteReferences} 
                handleStarterPackToggle={handleStarterPackToggle}
                handleRegisteredInSrpToggle={handleRegisteredInSrpToggle}
                handleSuppliesAppliedToggle={handleSuppliesAppliedToggle}
                selectedSiteRefs={selectedSiteRefs}
                setSelectedSiteRefs={setSelectedSiteRefs}
              />
              
              {/* Pagination Controls with Show All button */}
              {filteredSiteReferences.length > 0 && (
                <TableFooter 
                  showAll={showAll} 
                  setShowAll={setShowAll}
                  filteredReferencesCount={filteredSiteReferences.length}
                  selectedCount={selectedSiteRefs.length}
                  pagination={pagination}
                  exporting={exporting}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Empty state component
const EmptySitesState: React.FC = () => (
  <div className="text-center py-10">
    <h3 className="text-lg font-medium mb-2">No sites found</h3>
    <p className="text-muted-foreground text-sm">
      Try adjusting your filters or add more sites
    </p>
  </div>
);
