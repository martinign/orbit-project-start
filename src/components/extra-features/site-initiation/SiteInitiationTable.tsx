
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { SiteInitiationEditDialog } from './SiteInitiationEditDialog';
import { 
  TableHeader,
  FiltersPopover,
  SiteTableContent,
  DeleteSiteDialog,
  SiteErrorState,
  EmptySiteState,
  LoadingSiteState,
  useSiteTableData
} from './table';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface SiteInitiationTableProps {
  projectId?: string;
}

export const SiteInitiationTable: React.FC<SiteInitiationTableProps> = ({ projectId }) => {
  const {
    filteredSites,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    siteToEdit,
    setSiteToEdit,
    filtersOpen,
    setFiltersOpen,
    roleFilter,
    setRoleFilter,
    countryFilter,
    setCountryFilter,
    siteRefFilter,
    setSiteRefFilter,
    starterPackFilter,
    setStarterPackFilter,
    missingRolesFilter,
    setMissingRolesFilter,
    uniqueRoles,
    uniqueCountries,
    handleConfirmDelete,
    handleDeleteClick,
    handleEditClick,
    handleExportCSV,
    resetFilters,
    refetch,
    hasActiveFilters,
    activeFilterCount,
    siteToDelete,
    pagination
  } = useSiteTableData(projectId);

  if (error) {
    return <SiteErrorState error={error} />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <TableHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onExportCSV={handleExportCSV}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSiteState />
          ) : filteredSites.length === 0 ? (
            <EmptySiteState />
          ) : (
            <SiteTableContent 
              sites={filteredSites} 
              onEditSite={handleEditClick} 
              onDeleteSite={handleDeleteClick} 
            />
          )}
        </CardContent>
        {!loading && filteredSites.length > 0 && (
          <CardFooter className="flex justify-center border-t pt-4">
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => pagination.goToPage(page)}
            />
          </CardFooter>
        )}
      </Card>

      {/* Filters Popover */}
      <FiltersPopover
        open={filtersOpen}
        setOpen={setFiltersOpen}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        siteRefFilter={siteRefFilter}
        setSiteRefFilter={setSiteRefFilter}
        starterPackFilter={starterPackFilter}
        setStarterPackFilter={setStarterPackFilter}
        missingRolesFilter={missingRolesFilter}
        setMissingRolesFilter={setMissingRolesFilter}
        uniqueRoles={uniqueRoles}
        uniqueCountries={uniqueCountries}
        onResetFilters={resetFilters}
        children={<></>} // This is just a placeholder as the trigger is created elsewhere
      />

      {/* Delete Confirmation Dialog */}
      <DeleteSiteDialog 
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Edit Dialog */}
      {siteToEdit && (
        <SiteInitiationEditDialog
          site={siteToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          projectId={projectId}
          onSuccess={refetch}
        />
      )}
    </>
  );
};
