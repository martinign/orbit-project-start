
import React, { useState, useMemo } from 'react';
import { useSiteInitiationData, SiteData, isEligibleForStarterPack } from '@/hooks/useSiteInitiationData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Search, Download, Check, X, Filter, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiteInitiationEditDialog } from './SiteInitiationEditDialog';
import { toast } from '@/hooks/use-toast';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SiteInitiationTableProps {
  projectId?: string;
}

export const SiteInitiationTable: React.FC<SiteInitiationTableProps> = ({ projectId }) => {
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
  const [starterPackFilter, setStarterPackFilter] = useState<string>('all'); // Added starter pack filter

  // Extract unique roles, countries, and site references
  const uniqueRoles = useMemo(() => {
    const roles = new Set(sites.map(site => site.role));
    return Array.from(roles).sort();
  }, [sites]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(sites.filter(site => site.country).map(site => site.country as string));
    return Array.from(countries).sort();
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

      return matchesSearch && matchesRole && matchesCountry && matchesSiteRef && matchesStarterPack;
    });
  }, [sites, searchQuery, roleFilter, countryFilter, siteRefFilter, starterPackFilter]);

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
    setFiltersOpen(false);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load site data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Sites</CardTitle>
            <CardDescription>Manage site initiation data</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                  {(roleFilter !== 'all' || countryFilter !== 'all' || siteRefFilter || starterPackFilter !== 'all') && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {[
                        roleFilter !== 'all' ? 1 : 0, 
                        countryFilter !== 'all' ? 1 : 0, 
                        siteRefFilter ? 1 : 0,
                        starterPackFilter !== 'all' ? 1 : 0
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4 p-2">
                  <h3 className="font-medium">Filter Sites</h3>
                  
                  <div className="space-y-2">
                    <label htmlFor="site-ref-filter" className="text-sm font-medium">
                      Site Reference
                    </label>
                    <Input
                      id="site-ref-filter"
                      placeholder="Filter by site reference..."
                      value={siteRefFilter}
                      onChange={(e) => setSiteRefFilter(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="role-filter" className="text-sm font-medium">
                      Role
                    </label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger id="role-filter">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {uniqueRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="country-filter" className="text-sm font-medium">
                      Country
                    </label>
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger id="country-filter">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {uniqueCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="starter-pack-filter" className="text-sm font-medium">
                      Starter Pack
                    </label>
                    <Select value={starterPackFilter} onValueChange={setStarterPackFilter}>
                      <SelectTrigger id="starter-pack-filter">
                        <SelectValue placeholder="Select starter pack status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        <SelectItem value="eligible">LABP Sites (Eligible)</SelectItem>
                        <SelectItem value="sent">Starter Pack Sent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => setFiltersOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleExportCSV} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading sites...</div>
          ) : sites.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No sites found. Upload a CSV to import site data.
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Ref.</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1">
                              Starter Pack
                              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Starter packs are only sent to sites with LABP role</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.id} className={!isEligibleForStarterPack(site) ? "opacity-80" : undefined}>
                      <TableCell className="font-medium">
                        <HoverCard>
                          <HoverCardTrigger className="hover:underline cursor-help">
                            {site.pxl_site_reference_number}
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Site Details</h4>
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                <div className="font-medium">Site Reference:</div>
                                <div>{site.pxl_site_reference_number}</div>
                                
                                <div className="font-medium">Country:</div>
                                <div>{site.country || 'N/A'}</div>
                                
                                <div className="font-medium">Address:</div>
                                <div>{site.address || 'N/A'}</div>
                                
                                <div className="font-medium">City:</div>
                                <div>{site.city_town || 'N/A'}</div>
                                
                                <div className="font-medium">State/Province:</div>
                                <div>{site.province_state || 'N/A'}</div>
                                
                                <div className="font-medium">Zip Code:</div>
                                <div>{site.zip_code || 'N/A'}</div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger className="hover:underline cursor-help">
                            <div>
                              <div>{site.site_personnel_name}</div>
                              <div className="text-xs text-muted-foreground">PI: {site.pi_name || 'N/A'}</div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Personnel Details</h4>
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                <div className="font-medium">Name:</div>
                                <div>{site.site_personnel_name}</div>
                                
                                <div className="font-medium">Role:</div>
                                <div>{site.role}</div>
                                
                                <div className="font-medium">PI Name:</div>
                                <div>{site.pi_name || 'N/A'}</div>
                                
                                <div className="font-medium">Email:</div>
                                <div className="break-all">{site.site_personnel_email_address || 'N/A'}</div>
                                
                                <div className="font-medium">Phone:</div>
                                <div>{site.site_personnel_telephone || 'N/A'}</div>
                                
                                <div className="font-medium">Fax:</div>
                                <div>{site.site_personnel_fax || 'N/A'}</div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge 
                                className={site.role === 'LABP' ? 'bg-blue-500' : undefined}
                              >
                                {site.role}
                              </Badge>
                            </TooltipTrigger>
                            {site.role === 'LABP' && (
                              <TooltipContent>
                                <p>This role is eligible for a starter pack</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger className="hover:underline cursor-help">
                            {site.institution || 'N/A'}
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Institution Details</h4>
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                <div className="font-medium">Name:</div>
                                <div>{site.institution || 'N/A'}</div>
                                
                                <div className="font-medium">Country:</div>
                                <div>{site.country || 'N/A'}</div>
                                
                                <div className="font-medium">Address:</div>
                                <div>{site.address || 'N/A'}</div>
                                
                                <div className="font-medium">City:</div>
                                <div>{site.city_town || 'N/A'}</div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {site.site_personnel_email_address && (
                            <div className="truncate max-w-[150px]">{site.site_personnel_email_address}</div>
                          )}
                          {site.site_personnel_telephone && (
                            <div>{site.site_personnel_telephone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {isEligibleForStarterPack(site) ? (
                                site.starter_pack ? (
                                  <Badge className="flex items-center gap-1 bg-green-100 text-green-800">
                                    <Check className="h-3 w-3" /> Sent
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <X className="h-3 w-3" /> Not sent
                                  </Badge>
                                )
                              ) : (
                                <Badge variant="secondary" className="flex items-center gap-1 opacity-70">
                                  <X className="h-3 w-3" /> N/A
                                </Badge>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {isEligibleForStarterPack(site) 
                                ? site.starter_pack 
                                  ? "Starter pack has been sent" 
                                  : "Starter pack needs to be sent" 
                                : "This role is not eligible for a starter pack"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(site)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(site.id!)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this site record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
