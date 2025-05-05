
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Filter, List, Calendar, Mail, Phone, MapPin, User, Users, Info } from 'lucide-react';
import { SiteData } from '@/hooks/site-initiation/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from './display/ErrorState';
import { LoadingState } from './display/LoadingState';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getUniqueSiteReferences, isMissingLabpRole, REQUIRED_ROLES, getMissingRoles } from '@/hooks/site-initiation/siteUtils';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { supabase } from '@/integrations/supabase/client';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { format } from 'date-fns';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

interface StarterPacksTabProps {
  projectId?: string;
}

export const StarterPacksTab: React.FC<StarterPacksTabProps> = ({ projectId }) => {
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const { 
    allSites: sites, // Use allSites to get the full dataset for calculations
    loading, 
    error,
    isEligibleForStarterPack,
    refetch,
    pagination
  } = useAllSitesData(projectId, 10); // Set page size to 10

  // State to track optimistic UI updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({});
  
  // Update site function
  const updateSite = async (siteId: string, updates: Partial<SiteData>) => {
    try {
      const { error } = await supabase
        .from('project_csam_site')
        .update(updates)
        .eq('id', siteId);
      
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error updating site:', error);
      return false;
    }
  };

  // Get all unique site references
  const uniqueSiteReferences = useMemo(() => {
    return getUniqueSiteReferences(sites);
  }, [sites]);

  // Group sites by reference number
  const sitesByReference = useMemo(() => {
    const groupedSites: Record<string, SiteData[]> = {};
    
    uniqueSiteReferences.forEach(reference => {
      groupedSites[reference] = sites.filter(site => 
        site.pxl_site_reference_number === reference
      );
    });
    
    return groupedSites;
  }, [sites, uniqueSiteReferences]);
  
  // Get all unique countries from sites
  const uniqueCountries = useMemo(() => {
    const countries = new Set(sites
      .filter(site => site.country)
      .map(site => site.country as string));
    return Array.from(countries).sort();
  }, [sites]);

  // For each site reference, find if it has a LABP role site and if that site has a starter pack
  const siteReferenceData = useMemo(() => {
    return uniqueSiteReferences.map(reference => {
      const sitesForReference = sitesByReference[reference];
      const missingLabp = isMissingLabpRole(sites, reference);
      const labpSite = sitesForReference.find(site => site.role === 'LABP');
      const missingRoles = getMissingRoles(sites, reference);
      
      // Apply optimistic updates if they exist for this site
      const hasOptimisticUpdate = labpSite && labpSite.id && optimisticUpdates[labpSite.id] !== undefined;
      const starterPackStatus = hasOptimisticUpdate 
        ? optimisticUpdates[labpSite!.id!] 
        : (labpSite ? !!labpSite.starter_pack : false);
      
      // Find a representative site for display (prefer LABP if available)
      const representativeSite = labpSite || sitesForReference[0];
      
      return {
        reference,
        missingLabp,
        labpSite,
        hasStarterPack: starterPackStatus,
        starterPackUpdatedAt: labpSite?.updated_at,
        country: representativeSite.country || '',
        institution: representativeSite.institution || '',
        personnel: representativeSite.site_personnel_name || '',
        allSitesForReference: sitesForReference,
        missingRoles: missingRoles
      };
    });
  }, [uniqueSiteReferences, sitesByReference, sites, optimisticUpdates]);

  // Apply country filter to site references
  const filteredSiteReferences = useMemo(() => {
    if (countryFilter === "all") {
      return siteReferenceData;
    }
    return siteReferenceData.filter(site => site.country === countryFilter);
  }, [siteReferenceData, countryFilter]);

  // Update pagination when filtered data changes
  useEffect(() => {
    pagination.setTotalItems(filteredSiteReferences.length);
  }, [filteredSiteReferences, pagination]);
  
  // Calculate paginated data or show all data based on showAll state
  const displaySiteReferences = useMemo(() => {
    if (showAll) {
      return filteredSiteReferences;
    }
    return filteredSiteReferences.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    );
  }, [filteredSiteReferences, pagination.currentPage, pagination.pageSize, showAll]);
  
  // Calculate statistics (for all unique site references)
  const stats = useMemo(() => {
    // Total is all unique site references
    const totalSites = uniqueSiteReferences.length;
    
    // Count how many site references have a LABP site with a starter pack
    const sentCount = siteReferenceData.filter(site => site.hasStarterPack).length;
    
    // Calculate percentage
    const percentage = totalSites > 0 ? (sentCount / totalSites) * 100 : 0;
    
    return {
      total: totalSites,
      sent: sentCount,
      percentage: Math.round(percentage)
    };
  }, [uniqueSiteReferences, siteReferenceData]);

  // Handle starter pack toggle with optimistic UI update
  const handleStarterPackToggle = async (labpSite: SiteData | undefined, newValue: boolean) => {
    if (labpSite && labpSite.id) {
      // Apply optimistic update
      setOptimisticUpdates(prev => ({
        ...prev,
        [labpSite.id!]: newValue
      }));
      
      // Show optimistic toast
      toast({
        title: newValue ? "Marking starter pack as sent..." : "Marking starter pack as not sent...",
        description: `Updating status for ${labpSite.pxl_site_reference_number}`,
      });
      
      // Make the actual update
      const success = await updateSite(labpSite.id, { 
        starter_pack: newValue,
        updated_at: new Date().toISOString() // Update the timestamp
      });
      
      if (success) {
        toast({
          title: newValue ? "Starter pack marked as sent" : "Starter pack marked as not sent",
          description: `Updated status for ${labpSite.pxl_site_reference_number}`,
        });
        
        // No need to call refetch() as the real-time subscription will handle the update
      } else {
        // Revert optimistic update on failure
        setOptimisticUpdates(prev => {
          const newUpdates = { ...prev };
          delete newUpdates[labpSite.id!];
          return newUpdates;
        });
        
        toast({
          title: "Failed to update starter pack status",
          description: "Please try again",
          variant: "destructive"
        });
      }
    }
  };

  // Clear optimistic updates when sites data is refreshed
  useEffect(() => {
    setOptimisticUpdates({});
  }, [sites]);

  if (error) {
    return <ErrorState error={error} />;
  }

  // Render enhanced hover card content for a site
  const renderSiteHoverContent = (siteRef: typeof siteReferenceData[0]) => {
    // Get all sites with this reference number
    const allSites = siteRef.allSitesForReference;
    
    // Get the representative site (prefer LABP)
    const representativeSite = siteRef.labpSite || allSites[0];
    
    // Get all roles for this site reference
    const presentRoles = allSites.map(site => site.role);
    
    return (
      <div className="space-y-6 max-w-md">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Site Details</TabsTrigger>
            <TabsTrigger value="personnel">Personnel</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          
          {/* Site Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                <div className="font-medium">Reference:</div>
                <div>{siteRef.reference}</div>
                <div className="font-medium">Institution:</div>
                <div>{representativeSite.institution || 'Not specified'}</div>
                <div className="font-medium">Country:</div>
                <div>{representativeSite.country || 'Not specified'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Address Details
              </h4>
              <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                <div className="font-medium">Address:</div>
                <div>{representativeSite.address || 'Not specified'}</div>
                <div className="font-medium">City/Town:</div>
                <div>{representativeSite.city_town || 'Not specified'}</div>
                <div className="font-medium">Province/State:</div>
                <div>{representativeSite.province_state || 'Not specified'}</div>
                <div className="font-medium">Zip/Postal Code:</div>
                <div>{representativeSite.zip_code || 'Not specified'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Starter Pack Status
              </h4>
              <div className="mt-2">
                {siteRef.missingLabp ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Badge variant="outline" className="bg-amber-50">Missing LABP Role</Badge>
                    <span className="text-xs">Cannot send starter pack</span>
                  </div>
                ) : siteRef.hasStarterPack ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-green-600">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Sent</Badge>
                      <span className="text-xs">Starter pack has been sent</span>
                    </div>
                    {siteRef.starterPackUpdatedAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Sent on {format(new Date(siteRef.starterPackUpdatedAt), 'PPP')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Not Sent</Badge>
                    <span className="text-xs text-muted-foreground">Starter pack needs to be sent</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Personnel Tab */}
          <TabsContent value="personnel" className="space-y-4">
            {allSites.map(site => (
              <div key={site.id} className="border-b pb-3 last:border-b-0">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  {site.role}: {site.site_personnel_name}
                </h4>
                <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                  {site.pi_name && (
                    <>
                      <div className="font-medium">PI Name:</div>
                      <div>{site.pi_name}</div>
                    </>
                  )}
                  
                  {site.site_personnel_email_address && (
                    <>
                      <div className="font-medium">Email:</div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="break-all">{site.site_personnel_email_address}</span>
                      </div>
                    </>
                  )}
                  
                  {site.site_personnel_telephone && (
                    <>
                      <div className="font-medium">Phone:</div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{site.site_personnel_telephone}</span>
                      </div>
                    </>
                  )}
                  
                  {site.site_personnel_fax && (
                    <>
                      <div className="font-medium">Fax:</div>
                      <div>{site.site_personnel_fax}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {allSites.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-4">
                No personnel information available
              </div>
            )}
          </TabsContent>
          
          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Role Coverage
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                {REQUIRED_ROLES.map(role => {
                  const hasRole = presentRoles.includes(role);
                  return (
                    <div 
                      key={role} 
                      className={cn(
                        "p-1.5 rounded-md border flex justify-between items-center",
                        hasRole ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                      )}
                    >
                      <span>{role}</span>
                      {hasRole ? (
                        <Badge className="bg-green-600">Present</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 border-amber-700">Missing</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {siteRef.missingRoles.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-sm">
                <p className="font-medium text-amber-800">Missing {siteRef.missingRoles.length} required roles</p>
                <p className="text-xs mt-1">This site reference is missing the following roles: {siteRef.missingRoles.join(', ')}</p>
                {siteRef.missingLabp && (
                  <p className="text-xs font-medium mt-2 text-amber-900">LABP role is required for starter packs</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-muted/40">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-2">Starter Pack Progress</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-muted-foreground">Total Unique Sites</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-muted-foreground">Sites with Starter Packs</p>
                  <p className="text-2xl font-semibold">{stats.sent}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{stats.percentage}%</span>
              </div>
              <Progress value={stats.percentage} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Sites</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {countryFilter !== "all" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => setCountryFilter("all")}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : uniqueSiteReferences.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No sites found</h3>
              <p className="text-muted-foreground text-sm">
                Add sites to track starter pack status
              </p>
            </div>
          ) : filteredSiteReferences.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No sites found for this country</h3>
              <p className="text-muted-foreground text-sm">
                Try selecting a different country filter or add more sites
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Reference</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Personnel Name</TableHead>
                    <TableHead className="text-center">Starter Pack</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displaySiteReferences.map(siteRef => (
                    <HoverCard key={siteRef.reference} openDelay={300} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <TableRow className="cursor-pointer">
                          <TableCell className="font-medium">{siteRef.reference}</TableCell>
                          <TableCell>{siteRef.institution || 'Unknown'}</TableCell>
                          <TableCell>{siteRef.country || 'Unknown'}</TableCell>
                          <TableCell>{siteRef.personnel}</TableCell>
                          <TableCell className="text-center">
                            {siteRef.missingLabp ? (
                              <Badge variant="outline" className="bg-gray-100">
                                Missing LABP Role
                              </Badge>
                            ) : (
                              <div className="flex justify-center items-center gap-2">
                                <Switch 
                                  checked={siteRef.hasStarterPack} 
                                  onCheckedChange={(checked) => handleStarterPackToggle(siteRef.labpSite, checked)}
                                />
                                <span className={cn(
                                  "text-xs",
                                  siteRef.hasStarterPack ? "text-green-600" : "text-muted-foreground"
                                )}>
                                  {siteRef.hasStarterPack ? "Sent" : "Not sent"}
                                </span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-[450px] p-0">
                        {renderSiteHoverContent(siteRef)}
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls with Show All button */}
          {filteredSiteReferences.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <List className="h-4 w-4 mr-2" />
                {showAll ? "Show Paged" : "Show All"}
              </Button>
              
              {!showAll && (
                <PaginationControls
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={pagination.goToPage}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
