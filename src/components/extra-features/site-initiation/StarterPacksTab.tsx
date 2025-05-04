
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
    refetch
  } = useSiteInitiationData(projectId);

  // Filter only LABP sites
  const labpSites = useMemo(() => {
    return sites.filter(site => site.role === 'LABP');
  }, [sites]);

  // Get all unique countries from LABP sites
  const uniqueCountries = useMemo(() => {
    const countries = new Set(labpSites
      .filter(site => site.country)
      .map(site => site.country as string));
    return Array.from(countries).sort();
  }, [labpSites]);

  // Apply country filter
  const filteredSites = useMemo(() => {
    if (countryFilter === "all") {
      return labpSites;
    }
    return labpSites.filter(site => site.country === countryFilter);
  }, [labpSites, countryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSites = labpSites.length;
    const sentCount = labpSites.filter(site => site.starter_pack).length;
    const percentage = totalSites > 0 ? (sentCount / totalSites) * 100 : 0;
    
    return {
      total: totalSites,
      sent: sentCount,
      percentage: Math.round(percentage)
    };
  }, [labpSites]);

  // Handle starter pack toggle
  const handleStarterPackToggle = async (site: SiteData, newValue: boolean) => {
    if (site.id) {
      const success = await updateSite(site.id, { starter_pack: newValue });
      if (success) {
        toast({
          title: newValue ? "Starter pack marked as sent" : "Starter pack marked as not sent",
          description: `Updated status for ${site.pxl_site_reference_number}`,
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
          <CardTitle className="text-base">LABP Sites</CardTitle>
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
          ) : labpSites.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No LABP sites found</h3>
              <p className="text-muted-foreground text-sm">
                Add sites with the LABP role to track starter pack status
              </p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No LABP sites found for this country</h3>
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
                  {filteredSites.map(site => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.pxl_site_reference_number}</TableCell>
                      <TableCell>{site.institution || 'Unknown'}</TableCell>
                      <TableCell>{site.country || 'Unknown'}</TableCell>
                      <TableCell>{site.site_personnel_name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Switch 
                            checked={!!site.starter_pack} 
                            onCheckedChange={(checked) => handleStarterPackToggle(site, checked)}
                          />
                          <span className={cn(
                            "text-xs",
                            site.starter_pack ? "text-green-600" : "text-muted-foreground"
                          )}>
                            {site.starter_pack ? "Sent" : "Not sent"}
                          </span>
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
    </div>
  );
};
