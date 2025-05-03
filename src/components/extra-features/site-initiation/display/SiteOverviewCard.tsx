
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarterPackProgress } from './StarterPackProgress';
import { LocationTabs } from './LocationTabs';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { SiteSummary } from './useSiteSummary';

interface SiteOverviewCardProps {
  summary: SiteSummary;
  loading: boolean;
  sitesExist: boolean;
}

export const SiteOverviewCard: React.FC<SiteOverviewCardProps> = ({ 
  summary, 
  loading, 
  sitesExist 
}) => {
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
                labpSites={summary.labpSites} 
                starterPackSent={summary.starterPackSent} 
              />
            )}
            
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
