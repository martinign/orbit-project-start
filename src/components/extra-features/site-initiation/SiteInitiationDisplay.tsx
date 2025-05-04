
import React from 'react';
import { useSiteInitiationData, SiteData } from '@/hooks/useSiteInitiationData';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { SummaryStats } from './display/SummaryStats';
import { SiteOverviewCard } from './display/SiteOverviewCard';
import { ErrorState } from './display/ErrorState';
import { useSiteSummary } from './display/useSiteSummary';

interface SiteInitiationDisplayProps {
  projectId?: string;
}

export const SiteInitiationDisplay: React.FC<SiteInitiationDisplayProps> = ({ projectId }) => {
  // Use the new hook that fetches all sites for the overview
  const { sites, loading, error } = useAllSitesData(projectId);
  const summary = useSiteSummary(sites);
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  return (
    <div className="space-y-6">
      <SummaryStats summary={summary} loading={loading} />
      <SiteOverviewCard 
        summary={summary} 
        loading={loading} 
        sitesExist={sites.length > 0}
        sites={sites}
      />
    </div>
  );
};
