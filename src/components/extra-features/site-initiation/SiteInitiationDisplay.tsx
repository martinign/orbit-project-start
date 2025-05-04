
import React from 'react';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { SummaryStats } from './display/SummaryStats';
import { SiteOverviewCard } from './display/SiteOverviewCard';
import { ErrorState } from './display/ErrorState';
import { useSiteSummary } from './display/useSiteSummary';

interface SiteInitiationDisplayProps {
  projectId?: string;
}

export const SiteInitiationDisplay: React.FC<SiteInitiationDisplayProps> = ({ projectId }) => {
  // Use the updated hook with pagination capabilities
  // We still fetch all sites but will apply pagination in the components that display lists
  const { allSites, loading, error } = useAllSitesData(projectId);
  const summary = useSiteSummary(allSites);
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  return (
    <div className="space-y-6">
      <SummaryStats summary={summary} loading={loading} />
      <SiteOverviewCard 
        summary={summary} 
        loading={loading} 
        sitesExist={allSites.length > 0}
        sites={allSites}
      />
    </div>
  );
};
