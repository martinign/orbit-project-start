
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarterPackProgress } from './StarterPackProgress';
import { LocationTabs } from './LocationTabs';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { SiteSummary } from './useSiteSummary';
import { MissingRolesCard } from './MissingRolesCard';
import { SiteRolesCoverageTable } from './SiteRolesCoverageTable';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { SiteData } from '@/hooks/site-initiation';

interface SiteOverviewCardProps {
  summary: SiteSummary;
  loading: boolean;
  sitesExist: boolean;
  sites: SiteData[];
}

export const SiteOverviewCard: React.FC<SiteOverviewCardProps> = ({ 
  summary, 
  loading, 
  sitesExist,
  sites
}) => {
  const [showAllMissingRoles, setShowAllMissingRoles] = useState(false);
  const [focusOnLabp, setFocusOnLabp] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Initiation Overview</CardTitle>
        <CardDescription>
          Track and manage site initiation process across locations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState />
        ) : !sitesExist ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {summary.labpSites > 0 && (
              <StarterPackProgress 
                totalSites={summary.totalSites} 
                sitesWithStarterPack={summary.starterPackSent} 
              />
            )}

            {/* Missing Roles Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium">Role Coverage Analysis</h3>
                <div className="space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setFocusOnLabp(!focusOnLabp)}
                    className="text-xs h-8 px-2"
                  >
                    {focusOnLabp ? (
                      <>
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        All Roles
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 mr-1" />
                        LABP Only
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <MissingRolesCard 
                summary={summary} 
                focusOnLabp={focusOnLabp} 
              />
              
              {/* Site Role Coverage Table */}
              <SiteRolesCoverageTable sites={sites} />
            </div>
            
            <LocationTabs 
              countries={summary.countries} 
              institutions={summary.institutions} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
