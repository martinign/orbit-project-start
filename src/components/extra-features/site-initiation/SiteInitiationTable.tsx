
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    siteToDelete
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
