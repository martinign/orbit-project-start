
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationControls } from '@/components/ui/pagination-controls';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, AlertCircle } from 'lucide-react';
import { CRAData } from '@/hooks/cra-list/types';
import { useCraData } from '@/hooks/cra-list/useCraData';
import { CraTable } from './cra-list/CraTable';
import { CraSummaryStats } from './cra-list/CraSummaryStats';
import { CraListFilters } from './cra-list/CraListFilters';
import { CraEditDialog } from './cra-list/CraEditDialog';
import { CraDeleteDialog } from './cra-list/CraDeleteDialog';

interface CRAListTabProps {
  projectId?: string;
}

export const CRAListTab: React.FC<CRAListTabProps> = ({ projectId }) => {
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCra, setSelectedCra] = useState<CRAData | undefined>(undefined);
  const { user } = useAuth();

  // Use the new hook for CRA data
  const {
    cras,
    loading,
    error,
    totalCount,
    addCra,
    updateCra,
    deleteCra,
    toggleCraStatus,
    refetch
  } = useCraData(projectId, pageSize);

  // Pagination setup
  const { currentPage, totalPages, goToPage } = usePagination({
    pageSize,
    totalItems: totalCount
  });

  // Fetch admin access for permission checks
  const { data: hasAdminAccess } = useQuery({
    queryKey: ['admin_access', projectId],
    queryFn: async () => {
      if (!projectId) return false;
      
      const { data, error } = await supabase.rpc('has_project_admin_access', {
        project_id: projectId
      });
      
      if (error) {
        console.error('Error checking admin access:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!projectId,
  });

  // Get unique countries and roles for filters
  const countries = [...new Set(cras.map(cra => cra.study_country).filter(Boolean))] as string[];
  const roles = [...new Set(cras.map(cra => cra.study_team_role).filter(Boolean))] as string[];

  // Filter CRA entries based on all filters
  const filteredCras = cras.filter(cra => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      cra.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cra.study_site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cra.study_country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cra.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cra.study_team_role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || cra.status === statusFilter;
    
    // Country filter
    const matchesCountry = countryFilter === 'all' || cra.study_country === countryFilter;
    
    // Role filter
    const matchesRole = roleFilter === 'all' || cra.study_team_role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesCountry && matchesRole;
  });

  // Calculate pagination for the filtered results
  const paginatedCras = filteredCras.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCountryFilter('all');
    setRoleFilter('all');
  };

  // Handle CRA operations
  const handleAddCra = async (craData: CRAData) => {
    if (!projectId || !user?.id) return;
    
    await addCra({
      ...craData,
      project_id: projectId
    });
    
    refetch();
  };

  const handleEditCra = async (craData: CRAData) => {
    if (!craData.id || !projectId) return;
    
    await updateCra(craData.id, craData);
    refetch();
  };

  const handleDeleteCra = async () => {
    if (!selectedCra?.id) return;
    
    await deleteCra(selectedCra.id);
    refetch();
  };

  const handleToggleStatus = async (cra: CRAData) => {
    if (!cra.id || !cra.status) return;
    
    await toggleCraStatus(cra.id, cra.status);
    refetch();
  };

  // Open add/edit dialogs
  const openAddDialog = () => {
    setSelectedCra(undefined);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (cra: CRAData) => {
    setSelectedCra(cra);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (cra: CRAData) => {
    setSelectedCra(cra);
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start p-4 rounded-md bg-red-50 text-red-800">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Error loading CRA list</h3>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle>Clinical Research Associates (CRAs)</CardTitle>
            <CardDescription>Manage CRAs for this project. Import via CSV file from the Import tab.</CardDescription>
          </div>
          {hasAdminAccess && (
            <Button 
              onClick={openAddDialog}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add CRA
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && cras.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCras.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Statistics */}
            <CraSummaryStats craList={filteredCras} />
            
            {/* Search and Filters */}
            <CraListFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              countryFilter={countryFilter}
              onCountryFilterChange={setCountryFilter}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              countries={countries}
              roles={roles}
              onResetFilters={handleResetFilters}
            />
            
            {/* CRA Table */}
            <CraTable
              craList={paginatedCras}
              hasAdminAccess={!!hasAdminAccess}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onToggleStatus={handleToggleStatus}
            />
            
            {/* Pagination Controls */}
            {filteredCras.length > pageSize && (
              <div className="flex justify-center mt-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredCras.length / pageSize)}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No CRA entries found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery || statusFilter !== 'all' || countryFilter !== 'all' || roleFilter !== 'all' 
                ? 'Try adjusting your filters or search query.'
                : 'Import CRA data using the CSV Import tab or add CRAs manually.'}
            </p>
            
            {hasAdminAccess && (
              <Button 
                onClick={openAddDialog}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add your first CRA
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Add/Edit/Delete Dialogs */}
      <CraEditDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddCra}
        isEditing={false}
      />
      
      <CraEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleEditCra}
        initialData={selectedCra}
        isEditing={true}
      />
      
      <CraDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCra}
        craName={selectedCra?.full_name || 'this CRA'}
      />
    </Card>
  );
};
