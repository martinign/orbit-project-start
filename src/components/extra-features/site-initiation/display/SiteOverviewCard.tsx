
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarterPackProgress } from './StarterPackProgress';
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
              <MissingRolesCard summary={summary} focusOnLabp={focusOnLabp} />
              
              {/* Site Role Coverage Table */}
              <SiteRolesCoverageTable sites={sites} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
