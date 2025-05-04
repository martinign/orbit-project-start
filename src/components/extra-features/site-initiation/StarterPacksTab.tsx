
import React, { useState, useMemo } from 'react';
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
import { Check, X, Filter } from 'lucide-react';
import { useSiteInitiationData, SiteData } from '@/hooks/useSiteInitiationData';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StarterPackProgress } from './display/StarterPackProgress';
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

interface StarterPacksTabProps {
  projectId?: string;
}

export const StarterPacksTab: React.FC<StarterPacksTabProps> = ({ projectId }) => {
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const { 
    sites, 
    loading, 
    error, 
    updateSite,
    refetch,
    isEligibleForStarterPack
  } = useSiteInitiationData(projectId);

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

  // Calculate statistics (only for LABP sites)
  const stats = useMemo(() => {
    const labpSites = sites.filter(site => isEligibleForStarterPack(site));
    const totalSites = labpSites.length;
    const sentCount = labpSites.filter(site => site.starter_pack).length;
    const percentage = totalSites > 0 ? (sentCount / totalSites) * 100 : 0;
    
    return {
      total: totalSites,
      sent: sentCount,
      percentage: Math.round(percentage)
    };
  }, [sites, isEligibleForStarterPack]);

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
                  <p className="text-sm text-muted-foreground">Total LABP Sites</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-muted-foreground">Starter Packs Sent</p>
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
                  {filteredSiteReferences.map(siteRef => (
                    <TableRow key={siteRef.reference}>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
