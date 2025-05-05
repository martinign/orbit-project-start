
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
import { Filter, List, Calendar } from 'lucide-react';
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
import { getUniqueSiteReferences, isMissingLabpRole } from '@/hooks/site-initiation/siteUtils';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { supabase } from '@/integrations/supabase/client';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { format } from 'date-fns';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
  
  // Get an updateSite function from useSiteOperations hook
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
      
      // Find a representative site for display (prefer LABP if available)
      const representativeSite = labpSite || sitesForReference[0];
      
      return {
        reference,
        missingLabp,
        labpSite,
        hasStarterPack: labpSite ? !!labpSite.starter_pack : false,
        starterPackUpdatedAt: labpSite?.updated_at,
        country: representativeSite.country || '',
        institution: representativeSite.institution || '',
        personnel: representativeSite.site_personnel_name || ''
      };
    });
  }, [uniqueSiteReferences, sitesByReference, sites]);

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
  }, [filteredSiteReferences]);
  
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

  // Handle starter pack toggle
  const handleStarterPackToggle = async (labpSite: SiteData | undefined, newValue: boolean) => {
    if (labpSite && labpSite.id) {
      const success = await updateSite(labpSite.id, { starter_pack: newValue });
      if (success) {
        toast({
          title: newValue ? "Starter pack marked as sent" : "Starter pack marked as not sent",
          description: `Updated status for ${labpSite.pxl_site_reference_number}`,
        });
        refetch();
      }
    }
  };

  if (error) {
    return <ErrorState error={error} />;
  }

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
                      <HoverCardContent className="w-80">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold">Site Details</h4>
                            <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                              <div className="font-medium">Reference:</div>
                              <div>{siteRef.reference}</div>
                              <div className="font-medium">Institution:</div>
                              <div>{siteRef.institution || 'Unknown'}</div>
                              <div className="font-medium">Country:</div>
                              <div>{siteRef.country || 'Unknown'}</div>
                              <div className="font-medium">Personnel:</div>
                              <div>{siteRef.personnel || 'Unknown'}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold">Starter Pack Status</h4>
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
                        </div>
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
