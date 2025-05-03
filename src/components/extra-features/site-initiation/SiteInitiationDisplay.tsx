
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteInitiationData, isEligibleForStarterPack } from '@/hooks/useSiteInitiationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users, MapPin, Building, PackageCheck } from 'lucide-react';

interface SiteInitiationDisplayProps {
  projectId?: string;
}

export const SiteInitiationDisplay: React.FC<SiteInitiationDisplayProps> = ({ projectId }) => {
  const { sites, loading, error } = useSiteInitiationData(projectId);
  
  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!sites.length) return {
      totalSites: 0,
      countries: [],
      institutions: [],
      personnel: 0,
      starterPackSent: 0,
      labpSites: 0
    };
    
    // Count unique sites by reference number
    const uniqueSites = new Set(sites.map(s => s.pxl_site_reference_number));
    
    // Count unique countries
    const countries = new Set(sites.filter(s => s.country).map(s => s.country));
    
    // Count unique institutions
    const institutions = new Set(sites.filter(s => s.institution).map(s => s.institution));
    
    // LABP sites count (eligible for starter packs)
    const labpSites = sites.filter(s => isEligibleForStarterPack(s)).length;
    
    // Count starter packs sent (only valid for LABP roles)
    const starterPackSent = sites.filter(s => isEligibleForStarterPack(s) && s.starter_pack).length;
    
    return {
      totalSites: uniqueSites.size,
      countries: Array.from(countries),
      institutions: Array.from(institutions),
      personnel: sites.length,
      starterPackSent,
      labpSites
    };
  }, [sites]);
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load site initiation data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-blue-100 p-2">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">
                {loading ? '...' : summary.totalSites}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Personnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-purple-100 p-2">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">
                {loading ? '...' : summary.personnel}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-amber-100 p-2">
                <Building className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold">
                {loading ? '...' : summary.institutions.length}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-green-100 p-2">
                <Globe className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">
                {loading ? '...' : summary.countries.length}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">LABP Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-indigo-100 p-2">
                <PackageCheck className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold">
                {loading ? '...' : summary.labpSites}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Site Initiation Overview</CardTitle>
          <CardDescription>
            Track and manage site initiation process across locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading site data...</div>
          ) : sites.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No site initiation data available.</p>
              <p className="text-sm">Use the Import CSV tab to upload site data.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {summary.labpSites > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <PackageCheck className="h-4 w-4 mr-1 text-indigo-600" />
                    LABP Starter Pack Status 
                    <span className="text-xs ml-2 text-muted-foreground font-normal">
                      (only LABP sites are eligible)
                    </span>
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ 
                          width: summary.labpSites > 0 
                            ? `${(summary.starterPackSent / summary.labpSites) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {summary.starterPackSent} of {summary.labpSites} ({
                        summary.labpSites > 0 
                          ? Math.round((summary.starterPackSent / summary.labpSites) * 100) 
                          : 0
                      }%)
                    </span>
                  </div>
                </div>
              )}
              
              <Tabs defaultValue="countries">
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="countries">Countries</TabsTrigger>
                  <TabsTrigger value="institutions">Institutions</TabsTrigger>
                </TabsList>
                <TabsContent value="countries" className="pt-4">
                  {summary.countries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {summary.countries.map((country, index) => (
                        <div key={index} className="flex items-center p-2 rounded-md border">
                          <Globe className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{country}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No country data available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="institutions" className="pt-4">
                  {summary.institutions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {summary.institutions.map((institution, index) => (
                        <div key={index} className="flex items-center p-2 rounded-md border">
                          <Building className="h-4 w-4 mr-2 text-amber-500" />
                          <span>{institution}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No institution data available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
