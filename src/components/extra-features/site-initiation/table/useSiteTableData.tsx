import { useState, useMemo } from 'react';
import { useSiteInitiationData, SiteData, isEligibleForStarterPack } from '@/hooks/useSiteInitiationData';
import { toast } from '@/hooks/use-toast';
import { 
  getMissingRoles, 
  isMissingLabpRole, 
  getUniqueSiteReferences 
} from '@/hooks/site-initiation/siteUtils';

export const useSiteTableData = (projectId?: string) => {
  const { sites, loading, error, deleteSite, refetch } = useSiteInitiationData(projectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<SiteData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [siteRefFilter, setSiteRefFilter] = useState('');
  const [starterPackFilter, setStarterPackFilter] = useState<string>('all');
  const [missingRolesFilter, setMissingRolesFilter] = useState<string>('all');

  // Extract unique roles, countries, and site references
  const uniqueRoles = useMemo(() => {
    const roles = new Set(sites.map(site => site.role));
    return Array.from(roles).sort();
  }, [sites]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(sites.filter(site => site.country).map(site => site.country as string));
    return Array.from(countries).sort();
  }, [sites]);

  // Get site reference numbers with their missing roles status
  const siteReferencesMissingRolesMap = useMemo(() => {
    const uniqueReferences = getUniqueSiteReferences(sites);
    const result: Record<string, { missingAny: boolean, missingLabp: boolean }> = {};
    
    uniqueReferences.forEach(ref => {
      const missingRoles = getMissingRoles(sites, ref);
      const missingLabp = isMissingLabpRole(sites, ref);
      
      result[ref] = {
        missingAny: missingRoles.length > 0,
        missingLabp
      };
    });
    
    return result;
  }, [sites]);

  // Filter sites based on search query and filters
  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      // Text search
      const matchesSearch = searchQuery.trim() === '' || 
        site.pxl_site_reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.pi_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.site_personnel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.role?.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || site.role === roleFilter;
      
      // Country filter
      const matchesCountry = countryFilter === 'all' || site.country === countryFilter;
      
      // Site reference filter
      const matchesSiteRef = siteRefFilter === '' || 
        (site.pxl_site_reference_number && 
         site.pxl_site_reference_number.toLowerCase().includes(siteRefFilter.toLowerCase()));
      
      // Starter pack filter
      const matchesStarterPack = starterPackFilter === 'all' 
        ? true 
        : starterPackFilter === 'eligible' 
          ? isEligibleForStarterPack(site)
          : starterPackFilter === 'sent' && site.starter_pack === true;
      
      // Missing roles filter
      let matchesMissingRoles = true;
      const siteRef = site.pxl_site_reference_number;
      const siteMissingStatus = siteReferencesMissingRolesMap[siteRef];
      
      if (missingRolesFilter !== 'all' && siteMissingStatus) {
        if (missingRolesFilter === 'missing-any') {
          matchesMissingRoles = siteMissingStatus.missingAny;
        } else if (missingRolesFilter === 'missing-labp') {
          matchesMissingRoles = siteMissingStatus.missingLabp;
        } else if (missingRolesFilter === 'complete') {
          matchesMissingRoles = !siteMissingStatus.missingAny;
        }
      }

      return matchesSearch && matchesRole && matchesCountry && matchesSiteRef && matchesStarterPack && matchesMissingRoles;
    });
  }, [sites, searchQuery, roleFilter, countryFilter, siteRefFilter, starterPackFilter, missingRolesFilter, siteReferencesMissingRolesMap]);

  const handleDeleteClick = (id: string) => {
    setSiteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (siteToDelete) {
      await deleteSite(siteToDelete);
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
      refetch();
    }
  };

  const handleEditClick = (site: SiteData) => {
    setSiteToEdit(site);
    setEditDialogOpen(true);
  };

  const handleExportCSV = () => {
    if (!sites.length) {
      toast({
        title: "No data to export",
        description: "There are no sites to export to CSV.",
        variant: "default"
      });
      return;
    }

    // Define CSV headers
    const headers = [
      'Country',
      'PXL Site Reference Number',
      'PI Name',
      'Site Personnel Name',
      'Role',
      'Site Personnel Email Address',
      'Site Personnel Telephone',
      'Site Personnel Fax',
      'Institution',
      'Address',
      'City/Town',
      'Province/State',
      'Zip Code',
      'Starter Pack'
    ];

    // Map sites data to CSV format
    const csvData = sites.map(site => [
      site.country || '',
      site.pxl_site_reference_number || '',
      site.pi_name || '',
      site.site_personnel_name || '',
      site.role || '',
      site.site_personnel_email_address || '',
      site.site_personnel_telephone || '',
      site.site_personnel_fax || '',
      site.institution || '',
      site.address || '',
      site.city_town || '',
      site.province_state || '',
      site.zip_code || '',
      site.starter_pack ? 'Yes' : 'No'
    ]);

    // Create CSV content
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `site-initiation-${projectId}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${sites.length} sites to CSV.`,
      variant: "default"
    });
  };

  const resetFilters = () => {
    setRoleFilter('all');
    setCountryFilter('all');
    setSiteRefFilter('');
    setStarterPackFilter('all');
    setMissingRolesFilter('all');
    setFiltersOpen(false);
  };

  // Calculate if there are any active filters
  const hasActiveFilters = roleFilter !== 'all' || countryFilter !== 'all' || siteRefFilter !== '' || starterPackFilter !== 'all' || missingRolesFilter !== 'all';
  
  // Count the number of active filters
  const activeFilterCount = [
    roleFilter !== 'all' ? 1 : 0, 
    countryFilter !== 'all' ? 1 : 0, 
    siteRefFilter ? 1 : 0,
    starterPackFilter !== 'all' ? 1 : 0,
    missingRolesFilter !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return {
    sites,
    filteredSites,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDialogOpen,
    setDeleteDialogOpen,
    siteToDelete,
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
    handleDeleteClick,
    handleConfirmDelete,
    handleEditClick,
    handleExportCSV,
    resetFilters,
    refetch,
    hasActiveFilters,
    activeFilterCount,
    siteReferencesMissingRolesMap
  };
};
