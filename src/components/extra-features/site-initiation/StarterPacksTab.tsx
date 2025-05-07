
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from './display/ErrorState';
import { LoadingState } from './display/LoadingState';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import { SummaryCard } from './starter-packs/SummaryCard';
import { TableHeader } from './starter-packs/TableHeader';
import { SiteTable } from './starter-packs/SiteTable';
import { TableFooter } from './starter-packs/TableFooter';
import { useSiteReferences } from './starter-packs/hooks/useSiteReferences';
import { useStarterPackToggle } from './starter-packs/hooks/useStarterPackToggle';
import { useStarterPackStats } from './starter-packs/hooks/useStarterPackStats';
import { SiteData } from '@/hooks/site-initiation/types';

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

  // Function to export selected sites as CSV - UPDATED to include specific fields
  const handleExportCSV = async () => {
    if (selectedSiteRefs.length === 0) {
      toast({
        title: "No sites selected",
        description: "Please select at least one site to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get project data to include Sponsor and Protocol number
      let projectData = null;
      if (projectId) {
        const { data: project } = await supabase
          .from('projects')
          .select('Sponsor, project_number, protocol_number')
          .eq('id', projectId)
          .single();
        
        projectData = project;
      }

      // Get only LABP site data for the selected references
      const selectedLabpSites: SiteData[] = [];
      
      // For each selected reference, get only LABP sites with that reference
      for (const ref of selectedSiteRefs) {
        const labpSitesWithRef = sites.filter(site => 
          site.pxl_site_reference_number === ref && 
          site.role === 'LABP'
        );
        
        if (labpSitesWithRef.length > 0) {
          selectedLabpSites.push(...labpSitesWithRef);
        }
      }
      
      if (selectedLabpSites.length === 0) {
        toast({
          title: "No LABP data to export",
          description: "The selected sites don't have any LABP data to export.",
          variant: "destructive",
        });
        return;
      }

      // Create CSV header with only the requested fields
      const headers = [
        'Sponsor',
        'project_id',
        'Protocol number',
        'country',
        'province_state',
        'city_town',
        'zip_code',
        'pxl_site_reference_number',
        'institution',
        'address',
        'site_personnel_name',
        'site_personnel_email_address',
        'site_personnel_telephone',
        'site_personnel_fax'
      ];

      // Format data to CSV
      const csvRows = [headers.join(',')];
      selectedLabpSites.forEach(site => {
        const row = [
          projectData?.Sponsor || '',
          projectId || '',
          projectData?.protocol_number || '',
          site.country || '',
          site.province_state || '',
          site.city_town || '',
          site.zip_code || '',
          site.pxl_site_reference_number || '',
          site.institution || '',
          site.address || '',
          site.site_personnel_name || '',
          site.site_personnel_email_address || '',
          site.site_personnel_telephone || '',
          site.site_personnel_fax || ''
        ].map(value => {
          // Handle strings with commas by quoting them
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        
        csvRows.push(row.join(','));
      });

      // Create CSV content
      const csvContent = csvRows.join('\n');

      // Create a downloadable blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      
      // Create a file name with current date
      const date = new Date().toISOString().split('T')[0];
      const projectIdentifier = projectData?.project_number || projectId?.substring(0, 8) || 'all';
      link.download = `labp-site-data-${projectIdentifier}-${date}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export completed",
        description: `Successfully exported ${selectedLabpSites.length} LABP site records.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export failed",
        description: "Failed to generate CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : filteredSiteReferences.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No sites found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or add more sites
              </p>
            </div>
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
