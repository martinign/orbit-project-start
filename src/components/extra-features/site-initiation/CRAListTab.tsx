
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { SiteData } from '@/hooks/site-initiation/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Phone, Mail } from 'lucide-react';

interface CRAListTabProps {
  projectId?: string;
}

export const CRAListTab: React.FC<CRAListTabProps> = ({ projectId }) => {
  const { allSites, loading } = useAllSitesData(projectId);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter sites with CRA role
  const craSites = allSites.filter(site => site.role === 'CRA');
  
  // Apply search filter
  const filteredCRAs = searchQuery 
    ? craSites.filter(site => 
        site.site_personnel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (site.institution && site.institution.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (site.country && site.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (site.pxl_site_reference_number.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : craSites;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Research Associates (CRAs)</CardTitle>
          <CardDescription>
            View and search all CRAs across sites in this project.
          </CardDescription>
          
          <div className="flex items-center gap-2 mt-4">
            <Input
              placeholder="Search CRAs by name, institution, or site reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchQuery('')}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCRAs.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Reference</TableHead>
                    <TableHead>CRA Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCRAs.map((cra) => (
                    <TableRow key={cra.id}>
                      <TableCell className="font-medium">{cra.pxl_site_reference_number}</TableCell>
                      <TableCell>{cra.site_personnel_name}</TableCell>
                      <TableCell>{cra.institution || '-'}</TableCell>
                      <TableCell>
                        {cra.country ? (
                          <div className="flex flex-col">
                            <span>{cra.country}</span>
                            {cra.city_town && <span className="text-xs text-muted-foreground">{cra.city_town}</span>}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {cra.site_personnel_email_address && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs">{cra.site_personnel_email_address}</span>
                            </div>
                          )}
                          {cra.site_personnel_telephone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs">{cra.site_personnel_telephone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-2 text-lg font-medium">No CRAs Found</div>
              <p className="text-muted-foreground">
                {searchQuery ? "No CRAs match your search criteria" : "No CRAs have been added to this project yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
