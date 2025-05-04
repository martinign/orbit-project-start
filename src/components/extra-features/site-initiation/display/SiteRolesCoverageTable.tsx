
import React, { useState, useMemo, useEffect } from 'react';
import { Check, X, Filter } from 'lucide-react';
import { SiteData, REQUIRED_ROLES, getSitesWithSameReference, getMissingRoles, getUniqueSiteReferences } from '@/hooks/site-initiation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface SiteRolesCoverageTableProps {
  sites: SiteData[];
}

export const SiteRolesCoverageTable: React.FC<SiteRolesCoverageTableProps> = ({ sites }) => {
  const [countryFilter, setCountryFilter] = useState<string>("all");
  
  // Set up pagination (10 items per page)
  const pagination = usePagination({
    initialPageSize: 10,
    totalItems: 0 // Will be updated after filtering
  });
  
  // Get all unique countries from sites
  const uniqueCountries = useMemo(() => {
    const countries = new Set(sites.filter(site => site.country).map(site => site.country as string));
    return Array.from(countries).sort();
  }, [sites]);
  
  // Get all unique site references
  const uniqueReferences = getUniqueSiteReferences(sites);
  
  // Prepare site data by reference number
  const siteData = useMemo(() => {
    return uniqueReferences.map(refNumber => {
      const sitesWithSameRef = getSitesWithSameReference(sites, refNumber);
      const missingRoles = getMissingRoles(sites, refNumber);
      const existingRoles = REQUIRED_ROLES.filter(role => !missingRoles.includes(role));
      
      // Get institution name and country (use the first one if multiple exist for the same reference)
      const firstSite = sitesWithSameRef.find(site => site.institution);
      const institution = firstSite?.institution || 'Unknown';
      const country = firstSite?.country || 'Unknown';
      
      return {
        referenceNumber: refNumber,
        institution,
        country,
        existingRoles,
        missingRoles
      };
    });
  }, [sites, uniqueReferences]);

  // Filter sites by country if a country filter is selected
  const filteredSiteData = useMemo(() => {
    if (countryFilter === "all") {
      return siteData;
    }
    return siteData.filter(site => site.country === countryFilter);
  }, [siteData, countryFilter]);
  
  // Update pagination when filtered data changes
  useEffect(() => {
    pagination.setTotalItems(filteredSiteData.length);
  }, [filteredSiteData]);
  
  // Calculate paginated data
  const paginatedSiteData = useMemo(() => {
    return filteredSiteData.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    );
  }, [filteredSiteData, pagination.currentPage, pagination.pageSize]);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-base">Site Role Coverage</h3>
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
      </div>
      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Reference</TableHead>
              <TableHead>Institution</TableHead>
              {REQUIRED_ROLES.map(role => (
                <TableHead key={role} className="text-center">{role}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSiteData.map(site => (
              <TableRow key={site.referenceNumber}>
                <TableCell className="font-medium">{site.referenceNumber}</TableCell>
                <TableCell>{site.institution}</TableCell>
                {REQUIRED_ROLES.map(role => {
                  const hasRole = site.existingRoles.includes(role);
                  return (
                    <TableCell 
                      key={role} 
                      className={cn(
                        "text-center",
                        !hasRole && "text-destructive font-medium bg-destructive/10"
                      )}
                    >
                      {hasRole ? (
                        <div className="flex justify-center">
                          <Check size={16} className="text-green-600" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <X size={16} />
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {paginatedSiteData.length === 0 && (
              <TableRow>
                <TableCell colSpan={2 + REQUIRED_ROLES.length} className="h-24 text-center text-muted-foreground">
                  No sites found for the selected country
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {filteredSiteData.length > 0 && (
        <div className="flex justify-center mt-4">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
          />
        </div>
      )}
    </div>
  );
};
